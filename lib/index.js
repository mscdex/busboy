'use strict';

const { readdirSync } = require('fs');
const { join } = require('path');

const { parseContentType } = require('./utils.js');

function getInstance(cfg) {
  const headers = cfg.headers;
  const conType = parseContentType(headers['content-type']);
  if (!conType)
    throw new Error('Malformed content type');

  for (const type of TYPES) {
    const matched = type.detect(conType);
    if (!matched)
      continue;

    const instanceCfg = {
      limits: cfg.limits,
      headers,
      conType,
      highWaterMark: undefined,
      fileHwm: undefined,
      defCharset: undefined,
      preservePath: false,
    };
    if (cfg.highWaterMark)
      instanceCfg.highWaterMark = cfg.highWaterMark;
    if (cfg.fileHwm)
      instanceCfg.fileHwm = cfg.fileHwm;
    instanceCfg.defCharset = cfg.defCharset;
    instanceCfg.preservePath = cfg.preservePath;
    return new type(instanceCfg);
  }

  throw new Error(`Unsupported content type: ${headers['content-type']}`);
}

const TYPES = [];
for (const file of readdirSync(join(__dirname, 'types'))) {
  if (/\.js$/i.test(file)) {
    const type = require(`./types/${file}`);
    if (type && typeof type.detect === 'function')
      TYPES.push(type);
  }
}

module.exports = (cfg) => {
  if (typeof cfg !== 'object' || cfg === null)
    cfg = {};

  if (typeof cfg.headers !== 'object'
      || cfg.headers === null
      || typeof cfg.headers['content-type'] !== 'string') {
    throw new Error('Missing Content-Type');
  }

  return getInstance(cfg);
};
