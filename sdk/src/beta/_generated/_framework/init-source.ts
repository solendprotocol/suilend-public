import * as package_1 from "../_dependencies/source/0x1/init";
import * as package_2 from "../_dependencies/source/0x2/init";
import * as package_5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a from "../_dependencies/source/0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a/init";
import * as package_8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e from "../_dependencies/source/0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e/init";
import * as package_9d5c964fda4247e0e191c5856bcdb7c96d19800c82d2a4a6e52740a64bc44625 from "../suilend/init";
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
  package_9d5c964fda4247e0e191c5856bcdb7c96d19800c82d2a4a6e52740a64bc44625.registerClasses(
    structClassLoader,
  );
}
