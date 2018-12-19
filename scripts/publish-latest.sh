. functions.sh

echo "Running on branch ${TRAVIS_BRANCH}":

setup_git

# Make sure that the workspace is clean
# It could be "dirty" if
# 1. package-lock.json is not aligned with package.json
# 2. npm install is run
git checkout -- .

# Echo the status to the log so that we can see it is OK
git status

if check_version; then
  publish_latest
fi
