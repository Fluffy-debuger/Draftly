import { useEffect, useState, useContext, useMemo } from "react";
import { NoteBookContext } from "@/MyComponents/Dashboard/Dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Package, Download } from "lucide-react";

function Packages() {
  const { name } = useContext(NoteBookContext);
  const [packages, setPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [installprogress, setinstallprogress] = useState("");
  const [installing, setInstalling] = useState(false);

  const QuickInstallPkgs = [
    { name: 'Pandas', pkg: 'pandas', desc: 'Data manipulation & analysis' },
    { name: 'NumPy', pkg: 'numpy', desc: 'Fundamental scientific computing' },
    { name: 'Matplotlib', pkg: 'matplotlib', desc: '2D plotting library' },
    { name: 'Scikit-Learn', pkg: 'scikit-learn', desc: 'Machine learning tools' },
    { name: 'Seaborn', pkg: 'seaborn', desc: 'Statistical data visualization' },
    { name: 'Plotly', pkg: 'plotly', desc: 'Interactive graphing' }
  ];

  const [installingPkg, setInstallingPkg] = useState(null);

  const handleInstall = async (pkgName) => {
    if (installingPkg) return;

    setInstallingPkg(pkgName);
    setinstallprogress(`Installing ${pkgName}...`);

    try {
      const res = await fetch('http://127.0.0.1:8000/installPackage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebook_id: name,
          package: pkgName,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setinstallprogress(`Successfully installed ${pkgName}!`);
        await fetchpackages();
      } else {
        setinstallprogress(`Error: ${data.output || "Installation failed"}`);
      }
    } catch (err) {
      console.error("Installation error:", err);
      setinstallprogress("Failed to connect to the server.");
    } finally {
      setInstallingPkg(null);
    }
  };



  const fetchPackages = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/listAllPackages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notebook_id: name }),
      });
      const data = await res.json();
      setPackages(Array.isArray(data.res) ? data.res : []);
      console.log(packages);
      
    } catch (error) {
      console.error("Failed to fetch packages", error);
    }
  };

  useEffect(() => { fetchPackages(); }, [name]);

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg =>
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [packages, searchQuery]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Package size={20} className="text-blue-400" /> {name} Environment
        </h2>
      </div>

      <Tabs defaultValue="InstalledPackages">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="InstalledPackages">Installed Libraries</TabsTrigger>
          <TabsTrigger value="Installer">Quick Install</TabsTrigger>
        </TabsList>

        <TabsContent value="InstalledPackages">
          <Card >
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4" />
                <Input
                  placeholder="Search installed packages..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-2 p-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="pl-2">Package</span>
                  <span>Version</span>
                </div>
                <ScrollArea className="h-[300px] w-full">
                  {filteredPackages.map((pkg, idx) => (
                    <div key={idx} className="grid grid-cols-2 p-2 border-t transition-colors">
                      <span className="font-mono  text-xs">{pkg.name}</span>
                      <span className="font-mono  text-xs">{pkg.version}</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Installer">

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {QuickInstallPkgs.map((item) => (
              <Card key={item.pkg} className="transition-colors">
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-200">{item.name}</CardTitle>
                    <CardDescription className="text-[10px] leading-tight">{item.desc}</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    onClick={() => handleInstall(item.pkg)}
                    disabled={installing}
                  >
                    <Download size={14} className="mr-1" /> Install
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div> */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {QuickInstallPkgs.map((item) => (
              <Card key={item.pkg} className="bg-slate-900 border-slate-800">
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-100">{item.name}</CardTitle>
                    <CardDescription className="text-[11px]">{item.desc}</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={installingPkg !== null}
                    onClick={() => handleInstall(item.pkg)}
                    className="h-8 border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                  >
                    {installingPkg === item.pkg ? (
                      <span className="animate-spin mr-1">⌛</span>
                    ) : (
                      <Download size={14} className="mr-1" />
                    )}
                    {installingPkg === item.pkg ? "..." : "Install"}
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Packages;
