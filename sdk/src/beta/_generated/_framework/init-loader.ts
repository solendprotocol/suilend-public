import * as package_source_1 from "../_dependencies/source/0x1/init";
import * as package_source_2 from "../_dependencies/source/0x2/init";
import * as package_source_5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a from "../_dependencies/source/0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a/init";
import * as package_source_8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e from "../_dependencies/source/0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e/init";
import * as package_source_ba79417dd36e8fa1510f53b0491b7a8b2802217a81b1401b1efbb65e4994e016 from "../suilend/init";
import { StructClassLoader } from "./loader";

function registerClassesSource(loader: StructClassLoader) {
  package_source_1.registerClasses(loader);
  package_source_2.registerClasses(loader);
  package_source_5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a.registerClasses(
    loader,
  );
  package_source_8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e.registerClasses(
    loader,
  );
  package_source_ba79417dd36e8fa1510f53b0491b7a8b2802217a81b1401b1efbb65e4994e016.registerClasses(
    loader,
  );
}

export function registerClasses(loader: StructClassLoader) {
  registerClassesSource(loader);
}
