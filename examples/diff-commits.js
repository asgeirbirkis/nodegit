var nodegit = require("../");
var path = require("path");

// This code examines the diffs between a particular commit and all of its
// parents. Since this commit is not a merge, it only has one parent. This is
// similar to doing `git show`.

nodegit.Repository.open(path.resolve(__dirname, "../.git"))
.then(function(repo) {
  return repo.getCommit("59b20b8d5c6ff8d09518454d4dd8b7b30f095ab5");
})
.then(function(commit) {
  console.log("commit " + commit.sha());
  console.log("Author:", commit.author().name() +
    " <" + commit.author().email() + ">");
  console.log("Date:", commit.date());
  console.log("\n    " + commit.message());

  return commit.getDiff();
})
.then(function(diffList) {

  var result = [];
  var patchPromises = [];

  diffList.forEach(function(diff) {
    patchPromises.push(diff.patches()
      .then(function(patches) {
        result = result.concat(patches);
      })
    );
  });

  return Promise.all(patchPromises)
    .then(function() {
      return result;
    });
})
.then(function(patches){
  var result = [];
  var hunkPromises = [];

  patches.forEach(function(patch, patchIndex) {
    console.log("diff", patch.oldFile().path(), patch.newFile().path())
    hunkPromises.push(patch.hunks()
      .then(function(hunks) {
        result = result.concat(hunks);
      })
    );
  });

  return Promise.all(hunkPromises)
    .then(function() {
      return result;
    });
})
.then(function(hunks){
  var result = [];
  var linePromises = [];

  hunks.forEach(function(hunk) {
    console.log(hunk.header().trim());
    linePromises.push(hunk.lines()
      .then(function(lines) {
        result = result.concat(lines);
      })
    );
  });

  return Promise.all(linePromises)
    .then(function() {
      return result;
    });
})
.done(function(lines){
  lines.forEach(function(line) {
    console.log(String.fromCharCode(line.origin()) +
      line.content().trim());
  });
});