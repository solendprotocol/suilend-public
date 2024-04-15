import fs from "fs";

const flattenDir = (dirPath: string) => {
  const parentDirPath = dirPath.split("/").slice(0, -1).join("/");
  const tempDirPath = `${parentDirPath}_TEMP`;

  fs.cpSync(dirPath, tempDirPath, { recursive: true });
  fs.rmSync(parentDirPath, { recursive: true, force: true });
  fs.cpSync(tempDirPath, parentDirPath, { recursive: true });
  fs.rmSync(tempDirPath, { recursive: true, force: true });
};

// 1. Flatten sdk/src/ -> sdk/
flattenDir("./dist/sdk/src");

// 2. Delete sdk/beta/
fs.rmSync("./dist/sdk/beta", { recursive: true, force: true });

// 3. Flatten pyth-sdk/src/ -> pyth-sdk/
flattenDir("./dist/pyth-sdk/src");

// 4. Update pyth-sdk imports in sdk/
const SUILEND_SDK_ROOT = "./dist/sdk/";
const files = (
  fs.readdirSync(SUILEND_SDK_ROOT, { recursive: true }) as string[]
).filter(
  (file) =>
    !file.includes("_generated") &&
    (file.endsWith(".js") || file.endsWith(".ts")),
);
for (const file of files) {
  const fileString = fs.readFileSync(`${SUILEND_SDK_ROOT}${file}`, "utf8");
  if (!fileString.includes("../../pyth-sdk/src")) continue;

  fs.writeFileSync(
    `${SUILEND_SDK_ROOT}${file}`,
    fileString.replace(/..\/..\/pyth-sdk\/src/i, "pyth-sdk"),
    "utf8",
  );
}

// 5. Move pyth-sdk/ inside sdk/
fs.cpSync("./dist/pyth-sdk", "./dist/sdk/pyth-sdk", {
  recursive: true,
});
fs.rmSync("./dist/pyth-sdk", { recursive: true, force: true });

// 6. Flatten dist/sdk/ -> dist/
flattenDir("./dist/sdk");

// 7. Update package.json
import packageJson from "./package.json";
const newPackageJson = Object.assign({}, packageJson);

newPackageJson["private"] = false;
newPackageJson["main"] = "./index.js";
Object.entries(newPackageJson["exports"]).forEach(([key, value]) => {
  newPackageJson["exports"][key as keyof (typeof newPackageJson)["exports"]] =
    value.replace("./src/", "./");
});
newPackageJson["types"] = "./index.js";

fs.writeFileSync("./dist/package.json", JSON.stringify(newPackageJson), "utf8");
