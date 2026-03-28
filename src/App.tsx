import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

const NotFound = lazy(() => import("@/pages/NotFound.tsx"));
const Index = lazy(() => import("@/pages/Index.tsx"));

const App = () => (
  <TooltipProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
