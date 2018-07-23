import React from 'react';
import PropTypes from 'prop-types';
import RenderField from './RenderField';

class DocForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      changedFields: {},
      focusFields: {},
      blurFields: {},
      unValidFields: [],
      showConfirmModal: false,
      fileInclude: false
    }
    this.renderFields = this.renderFields.bind(this);
    this.renderField = this.renderField.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
    this.enableValidateField = this.enableValidateField.bind(this);
    this.onValidateStateChanged = this.onValidateStateChanged.bind(this);
    this.fieldsInitialValue = {}
  }

  onChange(res) {
    const {key, value, isValid, event } = res
    const { changedFields } = this.state
    if (!changedFields[key]) {
      changedFields[key] = true
      this.setState({ changedFields })
    }
    const initialValue = this.fieldsInitialValue[key]
    const updateData = Object.assign({}, this.props.data, {[key]: value})
    this.props.onChange({key, value, isValid, initialValue, updateData, event, resParameters: res})
  }

  onFocus(res) {
    const {key, value, isValid, event } = res
    const { focusFields } = this.state
    const {onFocus} = this.props
    if (!focusFields[key]) {
      focusFields[key] = true
      this.setState({ focusFields })
    }
    if(this.fieldsInitialValue[key] === undefined){
        this.fieldsInitialValue[key] !== value
    }
    const initialValue = this.fieldsInitialValue[key]
    onFocus && onFocus({key, value, isValid, initialValue, event, resParameters: res})
  }

  onBlur(res) {
    const {key, value, isValid, event } = res
    const { blurFields } = this.state
    const {onBlur} = this.props
    if (!blurFields[key]) {
      blurFields[key] = true
      this.setState({ blurFields })
    }
    const initialValue = this.fieldsInitialValue[key]
    onBlur && onBlur({key, value, isValid, initialValue, event, resParameters: res})
  }

  enableValidateField(field) {
    const {validateType} = this.props
    const {focusFields, blurFields, changedFields} = this.state
    let displayValidState = false;
    if(validateType === 'none') {
      displayValidState = false
    }else if(validateType === 'all'){
      displayValidState = true
    }else if(validateType === 'onFocus'){
      displayValidState = focusFields[field.key]
    } else if(validateType === 'onBlur'){
      displayValidState = blurFields[field.key]
    } else if(validateType === 'onChange'){
      displayValidState = changedFields[field.key]
    }
    return displayValidState
  }

  onValidateStateChanged(fieldKey, isValid) {
    let { unValidFields } = this.state
    const {onValidateStateChanged} = this.props
    if (isValid) {
      unValidFields = unValidFields.filter(field => field !== fieldKey)
      this.setState({ unValidFields }, () => {
        onValidateStateChanged && onValidateStateChanged({unValidFields, isValid: unValidFields.length < 1})
      })
    } else {
      unValidFields.push(fieldKey)
      this.setState({ unValidFields }, () => {
        onValidateStateChanged && onValidateStateChanged({unValidFields, isValid: false})
      })
    }
  }

  renderField(field) {
    const { data, requiredPrefix } = this.props
    return (
      <RenderField
        key={field.key}
        field={field}
        data={data}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onValidateStateChanged={this.onValidateStateChanged}
        displayValidState={this.enableValidateField(field)}
        toggleFileInclude={this.toggleFileInclude}
        requiredPrefix={requiredPrefix}
      />
    )
  }

  renderFields() {
    const { fields } = this.props;
    return fields.map(field => {
      return this.renderField(field);
    });
  }

  render() {
    return this.renderFields()
  }
}

DocForm.propTypes = {
  data: PropTypes.object, // {firstName: 'David', age: 35}
  fields: PropTypes.PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired, // firstName
    label: PropTypes.string.isRequired, // i18n('firstName')
    component: PropTypes.element.isRequired, // TextInput
    required: PropTypes.bool, // true
    formatter: PropTypes.func, // () => {field , documentData}
    validators: PropTypes.object, // { presence: true, email: true } // https://validatejs.org/#validators,
  })),
  validateType: PropTypes.oneOf(['none', 'all', 'onFocus', 'onBlur', 'onChange']),
  onChange: PropTypes.func.isRequired, // () => {key, value, isValid, initialValue, updateData, event, resParameters}
  onFocus: PropTypes.func, // () => {key, value, isValid, initialValue, event, resParameters}
  onBlur: PropTypes.func, // () => {key, value, isValid, initialValue, event, resParameters}
  onValidateStateChanged:  PropTypes.func, // () => {unValidFields, isValid}
  requiredPrefix:  PropTypes.string // *
};

DocForm.defaultProps = {
  data: {},
  fields: [],
  validateType: 'all',
  requiredPrefix: '*',
  onChange: () => console.warn('missing onChange')
};


export default DocForm;