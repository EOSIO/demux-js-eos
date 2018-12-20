#!/usr/bin/env bash

setup_git() {
  echo "Setting up git"

  # Set the user name and email to match the API token holder
  # This will make sure the git commits will have the correct photo
  # and the user gets the credit for a checkin
  git config --global user.email "devops@block.one"
  git config --global user.name "blockone-devops"
  git config --global push.default matching

  # Get the credentials from a file
  git config credential.helper "store --file=.git/credentials"

  # This associates the API Key with the account
  echo "https://${GITHUB_API_KEY}:@github.com" > .git/credentials
}

check_branch() {
  if ! [ "$(git symbolic-ref --short -q HEAD)" = "automate-publish" ]; then
    echo "✖ Current branch is not "automate-publish"!"
    echo "    Current branch: $(git symbolic-ref --short -q HEAD)"
    return 1
  fi
  echo "✔ Current branch is automate-publish"
  return 0
}

check_version() {
  if ! [ "$TRAVIS_TAG" = "$(npm run version --silent)" ]; then
    echo "Tag does not match the version in package.json!"
    echo "tag: $TRAVIS_TAG"
    echo "version: $(npm run version --silent)"
    return 1
  fi
  echo "✔ Tag matches version in package.json"
  echo "    Tag: $TRAVIS_TAG"
  echo "    Version: $(npm run version --silent)"
  return 0
}

publish_edge() {
  echo "Appending short commit hash to version"

  # Run the deploy build and increment the package versions
  current_commit="$(git rev-parse --short HEAD)";

  npm version prerelease -preid "${current_commit}" -no-git-tag-version

  git commit -a -m "Updating version [skip ci]"

  echo "Publish edge to NPM"

  cp .npmrc.template $HOME/.npmrc

  npm publish --tag edge
}

publish_latest() {
  echo "Publish new release to NPM"

  cp .npmrc.template $HOME/.npmrc

  npm publish
}
