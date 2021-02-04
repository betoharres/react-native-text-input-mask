import React, {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  useState,
  useLayoutEffect
} from "react";
import {
  TextInput,
  findNodeHandle,
  NativeModules,
  Platform
} from "react-native";
import { string, func, bool } from "prop-types";

const { mask, unmask, setMask } = NativeModules.RNTextInputMask;

const TextInputMask = React.forwardRef((props, ref) => {
  const [defaultValue, setDefaultValue] = useState(null);
  const [isMasked, setIsMasked] = useState(false);
  const input = useRef();

  useImperativeHandle(ref, () => ({
    blur: () => input.current.blur(),
    focus: () => input.current.focus(),
    clear: () => input.current.clear(),
    isFocused: () => input.current.isFocused(),
    getNativeRef: () => input.current.getNativeRef(),
    setNativeProps: nativeProps => input.current.setNativeProps(nativeProps)
  }));

  function handleOnChangeText(text) {
    if (props.mask && props.onChangeText && isMasked) {
      unmask(props.mask, text, unmasked => {
        props.onChangeText(text, unmasked);
      });
    } else {
      props.onChangeText(text);
    }
  }

  const setInputText = useCallback(
    text => {
      input.current?.setNativeProps?.({ text });
      if (!defaultValue) {
        setDefaultValue(text);
      }
    },
    [defaultValue]
  );

  useEffect(
    () => {
      if (props.mask && isMasked && props.value) {
        mask(props.mask, "" + props.value, setInputText);
      }
    },
    [props.mask, props.value, isMasked, setInputText]
  );

  useLayoutEffect(
    () => {
      if (props.mask && !isMasked) {
        setMask(findNodeHandle(input.current), props.mask);
        if (props.defaultValue) {
          mask(props.mask, "" + props.defaultValue, setInputText);
        }
        setIsMasked(true);
      }
    },
    [props.mask, props.defaultValue, isMasked, setInputText]
  );

  return (
    <TextInput
      {...props}
      ref={input}
      defaultValue={defaultValue}
      onChangeText={handleOnChangeText}
      multiline={Platform.select({ ios: false, android: props.multiline })}
    />
  );
});

TextInputMask.propTypes = {
  mask: string.isRequired,
  onChangeText: func.isRequired,
  defaultValue: string,
  value: string,
  multiline: bool,
  maskDefaultValue: bool
};

TextInputMask.defaultProps = {
  multiline: false
};

export { mask, unmask, setMask };
export default TextInputMask;
