import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; 

const useSessionCheck = () => {
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token && !redirected) {
      setRedirected(true); // Запрещаем повторный редирект
      navigate("/login");
    }
  }, [navigate, redirected]);
};

export default useSessionCheck;
