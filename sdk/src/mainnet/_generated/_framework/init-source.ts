import * as package_1 from "../_dependencies/source/0x1/init";
import * as package_2 from "../_dependencies/source/0x2/init";
import * as package_5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a from "../_dependencies/source/0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a/init";
import * as package_8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e from "../_dependencies/source/0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e/init";
import * as package_f95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf from "../suilend/init";
import { structClassLoaderSource as structClassLoader } from "./loader";

let initialized = false;
export function initLoaderIfNeeded() {
  if (initialized) {
    return;
  }
  initialized = true;
  package_1.registerClasses(structClassLoader);
  package_2.registerClasses(structClassLoader);
  package_5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a.registerClasses(
    structClassLoader,
  );
  package_8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e.registerClasses(
    structClassLoader,
  );
  package_f95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf.registerClasses(
    structClassLoader,
  );
}
