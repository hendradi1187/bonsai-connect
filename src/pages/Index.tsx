import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  // This page should not be reached since HomePage handles /
  return null;
};

export default Index;
