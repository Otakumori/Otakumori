// import type { Route } from "./+types/home";
// Removed because the file does not exist and is not needed.
import { Welcome } from '../welcome/welcome';

// Remove Route.MetaArgs usage in meta function
// export function meta({}: Route.MetaArgs) {
//   return [{ title: "Home" }];
// }

export default function Home() {
  return <Welcome />;
}
