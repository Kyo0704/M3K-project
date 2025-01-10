export const validateImageUri = (uri) => {
  if (!uri) {
    console.warn('Image URI is null or undefined');
    return false;
  }
  
  if (typeof uri !== 'string') {
    console.warn(`Invalid URI type: ${typeof uri}. Converting to string.`);
    return uri.toString();
  }
  
  return uri;
};