const useIsAndroid = () => {
  return /android/i.test(navigator.userAgent);
};

export default useIsAndroid;
