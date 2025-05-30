import assert from "@fs/../test-helpers";
import fs from "node:fs";
import path from "node:path";
import { read as readDirFiles } from "read-dir-files";
import { rimraf } from "rimraf";

import ncp from "../../src/libs/core/core-impl/lib/copy/copy.js";

/* eslint-env mocha */
const fixturesDir = path.join(__dirname, "fixtures");
describe("ncp", () => {
  describe("regular files and directories", () => {
    const fixtures = path.join(fixturesDir, "regular-fixtures");
    const src = path.join(fixtures, "src");
    const out = path.join(fixtures, "out");
    before((cb) => {
      rimraf(out)
        .then(() => ncp(src, out, cb))
        .catch(cb);
    });
    describe("when copying a directory of files", () => {
      it("files are copied correctly", (cb) => {
        readDirFiles(src, "utf8", (srcErr, srcFiles) => {
          readDirFiles(out, "utf8", (outErr, outFiles) => {
            assert(cb).ifError(srcErr);
            assert(cb).deepStrictEqual(srcFiles, outFiles);
            cb();
          });
        });
      });
    });
    describe("when copying files using filter", () => {
      before((cb) => {
        const filter = (name) => name.slice(-1) !== "a";
        rimraf(out)
          .then(() => ncp(src, out, { filter }, cb))
          .catch(cb);
      });
      it("files are copied correctly", (cb) => {
        readDirFiles(src, "utf8", (srcErr, srcFiles) => {
          function filter(files) {
            for (const fileName in files) {
              const curFile = files[fileName];
              if (curFile instanceof Object) {
                filter(curFile);
              } else if (fileName.endsWith("a")) {
                delete files[fileName];
              }
            }
          }
          filter(srcFiles);
          readDirFiles(out, "utf8", (outErr, outFiles) => {
            assert(cb).ifError(outErr);
            assert(cb).deepStrictEqual(srcFiles, outFiles);
            cb();
          });
        });
      });
    });
    describe("when using overwrite=true", () => {
      before(function () {
        this.originalCreateReadStream = fs.createReadStream;
      });
      after(function () {
        fs.createReadStream = this.originalCreateReadStream;
      });
      it("the copy is complete after callback", (done) => {
        ncp(src, out, { overwrite: true }, (err) => {
          fs.createReadStream = () => {
            done(new Error("createReadStream after callback"));
            throw new Error("createReadStream after callback");
          };
          assert(done).ifError(err);
          process.nextTick(done);
        });
      });
    });
    describe("when using overwrite=false", () => {
      beforeEach((done) => {
        rimraf(out)
          .then(() => done())
          .catch(done);
      });
      it("works", (cb) => {
        ncp(src, out, { overwrite: false }, (err) => {
          assert(cb).ifError(err);
          cb();
        });
      });
      it("should not error if files exist", (cb) => {
        ncp(src, out, () => {
          ncp(src, out, { overwrite: false }, (err) => {
            assert(cb).ifError(err);
            cb();
          });
        });
      });
      it("should error if errorOnExist and file exists", (cb) => {
        ncp(src, out, () => {
          ncp(
            src,
            out,
            {
              overwrite: false,
              errorOnExist: true,
            },
            (err) => {
              assert(cb)(err);
              cb();
            },
          );
        });
      });
    });
    describe("clobber", () => {
      beforeEach((done) => {
        rimraf(out)
          .then(() => done())
          .catch(done);
      });
      it("is an alias for overwrite", (cb) => {
        ncp(src, out, () => {
          ncp(
            src,
            out,
            {
              clobber: false,
              errorOnExist: true,
            },
            (err) => {
              assert(cb)(err);
              cb();
            },
          );
        });
      });
    });
    describe("when using transform", () => {
      it("file descriptors are passed correctly", (cb) => {
        ncp(
          src,
          out,
          {
            transform: (read, write, file) => {
              assert(done).notStrictEqual(file.name, undefined);
              assert(done).strictEqual(typeof file.mode, "number");
              read.pipe(write);
            },
          },
          cb,
        );
      });
    });
  });
  // see https://github.com/AvianFlu/ncp/issues/71
  describe("Issue 71: Odd Async Behaviors", () => {
    const fixtures = path.join(__dirname, "fixtures", "regular-fixtures");
    const src = path.join(fixtures, "src");
    const out = path.join(fixtures, "out");
    let totalCallbacks = 0;
    function copyAssertAndCount(done, callback) {
      // rimraf(out, function() {
      ncp(src, out, (err) => {
        assert(done).ifError(err);
        totalCallbacks += 1;
        readDirFiles(src, "utf8", (srcErr, srcFiles) => {
          readDirFiles(out, "utf8", (outErr, outFiles) => {
            assert(done).ifError(srcErr);
            assert(done).deepStrictEqual(srcFiles, outFiles);
            callback();
          });
        });
      });
      // })
    }
    describe("when copying a directory of files without cleaning the destination", () => {
      it("callback fires once per run and directories are equal", (done) => {
        const expected = 10;
        let count = 10;
        function next() {
          if (count > 0) {
            setTimeout(() => {
              copyAssertAndCount(done, () => {
                count -= 1;
                next();
              });
            }, 100);
          } else {
            // console.log('Total callback count is', totalCallbacks)
            assert(done).strictEqual(totalCallbacks, expected);
            done();
          }
        }
        next();
      });
    });
  });
});
