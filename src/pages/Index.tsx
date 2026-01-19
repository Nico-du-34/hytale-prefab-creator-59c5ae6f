import { Header } from "@/components/Header";
import { PrefabGenerator } from "@/components/PrefabGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PrefabGenerator />
      </main>
    </div>
  );
};

export default Index;
