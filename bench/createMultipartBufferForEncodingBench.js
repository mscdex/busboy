function createMultipartBufferForEncodingBench(boundary, amount, charset) {
  const filename = charset === 'utf-8' ? 'utf-8\'\'%c2%a3%20and%20%e2%82%ac%20rates' : `${charset}\'en\'%A3%20rates`;
  const head = '--' + boundary + '\r\n'
    + 'content-disposition: form-data; name="field1"\r\n'
    + 'content-type: text/plain;charset=' + charset + '; filename*=' + filename + '\r\n'
    + '\r\n', tail = '\r\n--' + boundary + '--\r\n', buffer = Buffer.concat([Buffer.from(head), Buffer.from(`
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus pretium leo ex, vitae dignissim felis viverra non. Praesent id quam ac elit tincidunt porttitor sed eget magna. Vivamus nibh ipsum, malesuada in eros sit amet, rutrum mattis leo. Ut nunc justo, ornare a finibus in, consectetur euismod sapien. Praesent facilisis, odio consectetur facilisis varius, tellus justo tristique sapien, non porttitor eros massa quis nibh. Nam blandit orci ac efficitur cursus. Nunc non mollis sapien, sit amet pretium odio. Nam vestibulum lectus ac orci egestas aliquet. Duis nec nibh quis augue consequat vulputate a a dui.

Aenean nec laoreet dolor, commodo aliquam leo. Quisque at placerat sem. In scelerisque cursus dolor, ac aliquam metus malesuada in. Vestibulum lacinia dolor purus, at convallis ipsum iaculis id. Integer bibendum sem neque, at bibendum enim lobortis eu. Cras pretium arcu eget congue cursus. Curabitur blandit ultricies mollis. Sed lacinia quis felis ut fringilla.

Nulla vitae lobortis metus. Morbi gravida risus tortor, in pulvinar massa lobortis vitae. Etiam vitae massa libero. Sed id tincidunt elit. Quisque congue felis vel aliquam varius. Sed a massa vitae lectus vehicula lacinia vitae ac justo. In commodo sodales nisi finibus vulputate. Suspendisse viverra, est eget fringilla gravida, nulla justo vulputate lorem, at eleifend nisi urna a eros. Sed sit amet ipsum vehicula, venenatis urna ac, interdum felis.

Cras semper mi magna, nec iaculis neque rhoncus at. In sit amet odio sed libero fringilla commodo. Sed hendrerit pulvinar turpis sed porta. Pellentesque consequat scelerisque sapien nec iaculis. Aenean sed nunc a purus laoreet efficitur id eu orci. Mauris tincidunt auctor congue. Aliquam nisi ligula, facilisis a molestie sed, luctus vitae mauris. Mauris at facilisis elit. Maecenas sodales pretium nisi in sodales. Cras nec blandit enim. Praesent in lacus et nibh varius suscipit in sit amet nibh.

Nam hendrerit justo eu lectus molestie, sit amet fringilla ipsum semper. Maecenas sit amet nunc elementum, interdum nunc eu, euismod ipsum. Vestibulum ut mauris sapien. Praesent nec felis ex. Fusce vel leo lobortis, mattis sem a, ullamcorper dolor. Aliquam erat volutpat. Fusce feugiat odio ut feugiat volutpat. Vestibulum magna ante, tempor in volutpat ut, gravida vitae justo. Praesent vitae eleifend eros. Integer feugiat molestie dolor, et pretium enim accumsan sit amet. Sed quis suscipit dui. Integer gravida dolor elit, sit amet fringilla odio commodo at. Quisque ut eleifend risus. Nunc mollis velit quis lectus laoreet pellentesque.\r\n\r\n`)]);

  const buffers = new Array(amount).fill(buffer);
  buffers.push(Buffer.from(tail));
  return Buffer.concat(buffers);
}
exports.createMultipartBufferForEncodingBench = createMultipartBufferForEncodingBench;
