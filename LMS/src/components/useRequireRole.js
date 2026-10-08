import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "./context";

// Redirects visitors whose role is not in `allowed`: guests go to sign-in,
// signed-in users without access go back to the dashboard.
export const useRequireRole = (allowed) => {
  const { usertype } = useContext(Context);
  const navigate = useNavigate();
  const permitted = allowed.includes(usertype);

  useEffect(() => {
    if (!permitted) {
      navigate(usertype === "Guest" ? "/" : "/dashboard", { replace: true });
    }
  }, [permitted, usertype, navigate]);

  return permitted;
};
