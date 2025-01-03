import DictData from './DictData'
import { DEFAULT_LABEL_FIELDS, DEFAULT_VALUE_FIELDS } from './const'
export default function(dict, dictMeta) {
  const label = determineDictField(dict, dictMeta.labelField, ...DEFAULT_LABEL_FIELDS)
  const value = determineDictField(dict, dictMeta.valueField, ...DEFAULT_VALUE_FIELDS)
  return new DictData(dict[label], dict[value], dict)
}

/**
 * 确定字典字段
 * @param {DictData} dict
 * @param  {...String} fields
 */
function determineDictField(dict, ...fields) {
  return fields.find(f => Object.prototype.hasOwnProperty.call(dict, f))
}
