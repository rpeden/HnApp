const parsers = require("./parser-definitions.js");
const cheerio = require("cheerio-without-node-native");
const _ = require('lodash')
//require("isomorphic-fetch");

const hackerNewsParser = (dom, promise, minPoints, logo) => {
  if (dom.err) { promise.reject({ site: "Hacker News", stories: []}); }
  const $ = dom.document;//jQuery(dom.window);
    // get the list of stories
  const stories = $(".athing");
  const parsedStories = [];
    // extract what we need from each story
  _.forEach(stories, (story) => {
    // extract div containing story
    const storyAnchor = $(story).find(".title a").first();
    // extract url
    let address = storyAnchor.attr("href");
    if (!address.startsWith("http")) {
      address = `https://news.ycombinator.com/${address}`;
    }
    // extract story title
    const title = storyAnchor.text();
    // extract score/points
    const points = parseInt($(story).next().find(".score").text()) || 0;
    // extract domain
    const domain = $(story).find('.sitestr').text();
    
    if (points >= minPoints) {
      parsedStories.push({
        title,
        address,
        points,
        domain
      });
    }
  });
  promise.resolve({site: "Hacker News", stories: parsedStories, logo});
};

const makeHNParser = (minimumPoints, logo) => {
  return new Promise((resolve, reject) => {
    fetch("https://news.ycombinator.com")
      .then((response) => {
        return response.text();
      })
      .then((body) => {
        const doc = cheerio.load(body);
        hackerNewsParser({err: null, document: doc}, {resolve, reject}, minimumPoints, logo);
      })
      .catch((error) => reject(error));
  });
};

const redditParser = (dom, promise, title, minPoints, logo) => {
  if (dom.err) { promise.reject([]); }
  const $ = dom.document;//jQuery(dom.window);
  // extract the stories
  const stories = $(".link");
  const parsedStories = [];

    // extract what we need from each story
  stories.forEach((story) => {
    //extract title
    const titleAnchor = $(story).find(".title").find(".title");
    const titleText = titleAnchor.text();
    // extract URL
    let address = titleAnchor.attr("href") || "";
    if (!address.startsWith("http")) {
      address = `https://www.reddit.com${address}`;
    }
    // extract score/points
    const points = parseInt($(story).find(".likes").text()) || 0;
    if (points >= minPoints) {
      parsedStories.push({
        title: titleText,
        address,
        points
      });
    }
  });
  promise.resolve({ site: title, stories: parsedStories, logo});
};

const makeRedditParser = (subReddit, title, minimumPoints, logo) => {
  return new Promise((resolve, reject) => {
    fetch(`https://www.reddit.com/r/${subReddit}`)
      .then((response) => response.text())
      .then((body) => {
        const doc = cheerio.load(body);
        redditParser({ err: null, document: doc},
                     { resolve, reject },
                     title, minimumPoints, logo);
      })
      .catch((error) => reject(error));
  });
};

const createParser = (parserInfo) => {
  switch (parserInfo.type) {
  case "HackerNews":
    return makeHNParser(parserInfo.minimumScore, parserInfo.logo);
  case "Reddit":
    return makeRedditParser(parserInfo.subReddit, parserInfo.title,
                            parserInfo.minimumScore, parserInfo.logo);
  default:
    return Promise.resolve();
  }
};

const getStories = () => {
  return Promise.all(parsers.map(createParser));
};

module.exports = {
  getStories
};
