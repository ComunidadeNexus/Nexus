import { Navigate, useLocation, useParams } from "react-router-dom";

/** Redirects alias paths (EN / accented) to canonical PT-BR routes, keeping params. */
const AliasRedirect = ({ to }: { to: string }) => {
  const params = useParams();
  const location = useLocation();

  let dest = to;
  Object.entries(params).forEach(([key, value]) => {
    dest = dest.replace(`:${key}`, encodeURIComponent(value ?? ""));
  });

  return <Navigate to={`${dest}${location.search}${location.hash}`} replace />;
};

export default AliasRedirect;
