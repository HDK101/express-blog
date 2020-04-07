const { getConfig, setConfig } = require("../Server/configParser");
const assert = require("assert");

describe("Tests for config parser", () => {
  beforeEach(done => {
    testConfig = {
      blogName: "blogName",
      port: 3000,
      secretKey: "13928355814627241108674344676615",
      initialized: true
    };
    setConfig(testConfig, true);
    done();
  });

  it("Check if config exists", done => {
    const config = getConfig(true);
    assert(config.blogName == "blogName");
    assert(config.initialized == true);
    done();
  });
});
