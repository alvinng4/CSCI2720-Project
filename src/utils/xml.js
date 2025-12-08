const { parseString } = require('xml2js');

/**
 * 解析 XML 字符串为 JavaScript 对象
 * @param {string} xmlContent - XML 内容字符串
 * @returns {Promise<Object>} 解析后的对象
 */
function parseXml(xmlContent) {
  return new Promise((resolve, reject) => {
    // 配置选项：
    // - trim: 去除文本前后空格
    // - explicitArray: 非数组节点不强制转为数组
    // - mergeAttrs: 属性合并到父节点（如 <venue id="100"> 中的 id 会成为对象属性）
    const options = {
      trim: true,
      explicitArray: false,
      mergeAttrs: true,
      // 处理 CDATA 内容（将 <![CDATA[...]]> 中的内容提取为 _text 属性）
      cdataProcessors: {
        _text: (value) => value.trim()
      }
    };

    parseString(xmlContent, options, (err, result) => {
      if (err) {
        reject(new Error(`XML 解析错误: ${err.message}`));
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = { parseXml };