function requireModule(fullpath: string): any {
  let exported;
  try {
    exported = require(fullpath);
  } catch (err) {
    if (err instanceof Error && (err as Error & {code?: string}).code !== 'ERR_REQUIRE_ESM') {
      throw err;
    }

    return import(fullpath).then(result => (result.default || {}));
  }

  if (exported && Object.prototype.hasOwnProperty.call(exported, 'default')) {
    return exported.default;
  }

  return exported;
}

export = requireModule;
