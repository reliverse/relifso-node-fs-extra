import assert from "@fs/../test-helpers";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import proxyquire from "proxyquire";

import * as fse from "../../index.js";

let gracefulFsStub;
let utimes;

// HFS, ext{2,3}, FAT do not
function hasMillisResSync() {
  let tmpfile = path.join(`millis-test-sync${Date.now().toString()}${Math.random().toString().slice(2)}`);
  tmpfile = path.join(os.tmpdir(), tmpfile);
  // 550 millis past UNIX epoch
  const d = new Date(1435410243862);
  fs.writeFileSync(tmpfile, "https://github.com/jprichardson/node-fs-extra/pull/141");
  const fd = fs.openSync(tmpfile, "r+");
  fs.futimesSync(fd, d, d);
  fs.closeSync(fd);
  // @ts-expect-error TODO: fix ts
  return fs.statSync(tmpfile).mtime > 1435410243000;
}

describe("utimes", () => {
  let TEST_DIR;

  beforeEach((done) => {
    TEST_DIR = path.join(os.tmpdir(), "fs-extra", "utimes");
    fse.emptyDir(TEST_DIR, done);
    // reset stubs
    gracefulFsStub = {};
    utimes = proxyquire("../utimes", { "../fs": gracefulFsStub });
  });

  describe("utimesMillis()", () => {
    // see discussion https://github.com/jprichardson/node-fs-extra/pull/141
    it("should set the utimes w/ millisecond precision", (done) => {
      const tmpFile = path.join(TEST_DIR, "someFile");
      fs.writeFileSync(tmpFile, "hello");

      let stats = fs.lstatSync(tmpFile);

      // Apr 21st, 2012
      const awhileAgo = new Date(1334990868773);
      const awhileAgoNoMillis = new Date(1334990868000);

      assert.notDeepStrictEqual(stats.mtime, awhileAgo);
      assert.notDeepStrictEqual(stats.atime, awhileAgo);

      utimes.utimesMillis(tmpFile, awhileAgo, awhileAgo, (err) => {
        assert.ifError(err);
        stats = fs.statSync(tmpFile);
        if (hasMillisResSync()) {
          assert.deepStrictEqual(stats.mtime, awhileAgo);
          assert.deepStrictEqual(stats.atime, awhileAgo);
        } else {
          assert.deepStrictEqual(stats.mtime, awhileAgoNoMillis);
          assert.deepStrictEqual(stats.atime, awhileAgoNoMillis);
        }
        done();
      });
    });

    // TODO: this doesn't work with proxyquire+ts-node.
    // it('should close open file desciptors after encountering an error', done => {
    //     /** @type {typeof import('assert')} */ const ass = assert(done);

    //     const fakeFd = Math.random();

    //     gracefulFsStub.open = u((pathIgnored, flagsIgnored, modeIgnored, callback) => {
    //         if (typeof modeIgnored === 'function') callback = modeIgnored;
    //         process.nextTick(() => callback(null, fakeFd));
    //     });

    //     let closeCalled = false;
    //     gracefulFsStub.close = u((fd, callback) => {
    //         ass.strictEqual(fd, fakeFd);
    //         closeCalled = true;
    //         if (callback) process.nextTick(callback);
    //     });

    //     let testError;
    //     gracefulFsStub.futimes = u((fd, atimeIgnored, mtimeIgnored, callback) => {
    //         process.nextTick(() => {
    //             testError = new Error('A test error');
    //             callback(testError);
    //         });
    //     });

    //     utimes.utimesMillis('ignored', 'ignored', 'ignored', err => {
    //         ass.strictEqual(err, testError);
    //         ass(closeCalled);
    //         done();
    //     });
    // });
  });
});
