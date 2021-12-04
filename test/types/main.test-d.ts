import BusboyDefault, { BusboyConstructor, BusboyConfig, BusboyHeaders, Busboy, BusboyEvents, BusboyFileStream } from '../..';
import {expectError, expectType} from "tsd";
import BusboyESM from "../..";

// test type exports
type Constructor = BusboyConstructor;
type Config = BusboyConfig;
type Headers = BusboyHeaders;
type Events = BusboyEvents;
type BB = Busboy;

expectType<Busboy>(new BusboyESM({ headers: { 'content-type': 'foo' } }));
expectType<Busboy>(new Busboy({ headers: { 'content-type': 'foo' } }));

expectError(new BusboyDefault({}));
const busboy = BusboyDefault({ headers: { 'content-type': 'foo' } }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' } }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, highWaterMark: 1000 }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, fileHwm: 1000 }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, defCharset: 'utf8' }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, preservePath: true }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, limits: { fieldNameSize: 200 } }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, limits: { fieldSize: 200 } }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, limits: { fields: 200 } }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, limits: { fileSize: 200 } }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, limits: { files: 200 } }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, limits: { parts: 200 } }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, limits: { headerPairs: 200 } }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, limits: { headerSize: 200 } }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, isPartAFile: (fieldName, contentType, fileName) => fieldName === 'my-special-field' || fileName !== 'not-so-special.txt' }); // $ExpectType Busboy
new BusboyDefault({ headers: { 'content-type': 'foo' }, isPartAFile: (fieldName, contentType, fileName) => fileName !== undefined }); // $ExpectType Busboy

busboy.addListener('file', (fieldname, file, filename, encoding, mimetype) => {
    expectType<string> (fieldname)
    expectType<BusboyFileStream>(file);
    expectType<string>(filename);
    expectType<string>(encoding);
    expectType<string>(mimetype);
});
busboy.addListener('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expectType<string> (fieldname);
    expectType<string> (val);
    expectType<boolean> (fieldnameTruncated);
    expectType<boolean> (valTruncated);
    expectType<string> (encoding);
    expectType<string> (mimetype);
});
busboy.addListener('partsLimit', () => {});
busboy.addListener('filesLimit', () => {});
busboy.addListener('fieldsLimit', () => {});
busboy.addListener('error', e => {
    expectType<unknown> (e);
});
busboy.addListener('finish', () => {});
// test fallback
busboy.on('foo', foo => {
    expectType<any> (foo);
});
busboy.on(Symbol('foo'), foo => {
    expectType<any>(foo);
});

busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    expectType<string> (fieldname);
    expectType<BusboyFileStream> (file);
    expectType<string> (filename);
    expectType<string> (encoding);
    expectType<string> (mimetype);
});
busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expectType<string> (fieldname);
    expectType<string> (val);
    expectType<boolean> (fieldnameTruncated);
    expectType<boolean> (valTruncated);
    expectType<string> (encoding);
    expectType<string> (mimetype);
});
busboy.on('partsLimit', () => {});
busboy.on('filesLimit', () => {});
busboy.on('fieldsLimit', () => {});
busboy.on('error', e => {
    expectType<unknown> (e);
});
busboy.on('finish', () => {});
// test fallback
busboy.on('foo', foo => {
    expectType<any> (foo);
});
busboy.on(Symbol('foo'), foo => {
    expectType<any> (foo);
});

busboy.once('file', (fieldname, file, filename, encoding, mimetype) => {
    expectType<string> (fieldname);
    expectType<BusboyFileStream> (file);
    expectType<string> (filename);
    expectType<string> (encoding);
    expectType<string> (mimetype);
});
busboy.once('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expectType<string> (fieldname);
    expectType<string> (val);
    expectType<boolean> (fieldnameTruncated);
    expectType<boolean> (valTruncated);
    expectType<string> (encoding);
    expectType<string> (mimetype);
});
busboy.once('partsLimit', () => {});
busboy.once('filesLimit', () => {});
busboy.once('fieldsLimit', () => {});
busboy.once('error', e => {
    expectType<unknown> (e);
});
busboy.once('finish', () => {});
// test fallback
busboy.once('foo', foo => {
    expectType<any> (foo);
});
busboy.once(Symbol('foo'), foo => {
    expectType<any> (foo);
});

busboy.removeListener('file', (fieldname, file, filename, encoding, mimetype) => {
    expectType<string> (fieldname);
    expectType<BusboyFileStream> (file);
    expectType<string> (filename);
    expectType<string> (encoding);
    expectType<string> (mimetype);
});
busboy.removeListener('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expectType<string> (fieldname);
    expectType<string> (val);
    expectType<boolean> (fieldnameTruncated);
    expectType<boolean> (valTruncated);
    expectType<string> (encoding);
    expectType<string> (mimetype);
});
busboy.removeListener('partsLimit', () => {});
busboy.removeListener('filesLimit', () => {});
busboy.removeListener('fieldsLimit', () => {});
busboy.removeListener('error', e => {
    expectType<unknown> (e);
});
busboy.removeListener('finish', () => {});
// test fallback
busboy.removeListener('foo', foo => {
    expectType<any> (foo);
});
busboy.removeListener(Symbol('foo'), foo => {
    expectType<any> (foo);
});

busboy.off('file', (fieldname, file, filename, encoding, mimetype) => {
    expectType<string> (fieldname);
    expectType<BusboyFileStream> (file);
    expectType<string> (filename);
    expectType<string> (encoding);
    expectType<string> (mimetype);
});
busboy.off('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expectType<string> (fieldname);
    expectType<string> (val);
    expectType<boolean> (fieldnameTruncated);
    expectType<boolean> (valTruncated);
    expectType<string> (encoding);
    expectType<string> (mimetype);
});
busboy.off('partsLimit', () => {});
busboy.off('filesLimit', () => {});
busboy.off('fieldsLimit', () => {});
busboy.off('error', e => {
    expectType<unknown> (e);
});
busboy.off('finish', () => {});
// test fallback
busboy.off('foo', foo => {
    expectType<any> (foo);
});
busboy.off(Symbol('foo'), foo => {
    expectType<any> (foo);
});

busboy.prependListener('file', (fieldname, file, filename, encoding, mimetype) => {
    expectType<string> (fieldname);
    expectType<BusboyFileStream> (file);
    expectType<string> (filename);
    expectType<string> (encoding);
    expectType<string> (mimetype);
});
busboy.prependListener('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expectType<string> (fieldname);
    expectType<string> (val);
    expectType<boolean> (fieldnameTruncated);
    expectType<boolean> (valTruncated);
    expectType<string> (encoding);
    expectType<string> (mimetype);
});
busboy.prependListener('partsLimit', () => {});
busboy.prependListener('filesLimit', () => {});
busboy.prependListener('fieldsLimit', () => {});
busboy.prependListener('error', e => {
    expectType<unknown> (e);
});
busboy.prependListener('finish', () => {});
// test fallback
busboy.prependListener('foo', foo => {
    expectType<any> (foo);
});
busboy.prependListener(Symbol('foo'), foo => {
    expectType<any> (foo);
});

busboy.prependOnceListener('file', (fieldname, file, filename, encoding, mimetype) => {
    expectType<string> (fieldname);
    expectType<BusboyFileStream> (file);
    expectType<string> (filename);
    expectType<string> (encoding);
    expectType<string> (mimetype);
});
busboy.prependOnceListener('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expectType<string> (fieldname);
    expectType<string> (val);
    expectType<boolean> (fieldnameTruncated);
    expectType<boolean> (valTruncated);
    expectType<string> (encoding);
    expectType<string> (mimetype);
});
busboy.prependOnceListener('partsLimit', () => {});
busboy.prependOnceListener('filesLimit', () => {});
busboy.prependOnceListener('fieldsLimit', () => {});
busboy.prependOnceListener('error', e => {
    expectType<unknown> (e);
});
busboy.prependOnceListener('finish', () => {});
// test fallback
busboy.prependOnceListener('foo', foo => {
    expectType<any> (foo);
});
busboy.prependOnceListener(Symbol('foo'), foo => {
    expectType<any> (foo);
});
