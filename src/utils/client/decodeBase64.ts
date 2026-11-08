// Judge0 output arrives base64-encoded. atob() yields one character per byte,
// so the bytes are re-joined as percent escapes to decode them as UTF-8.
const decodeBase64 = (value?: string | null) => {
  if (!value) {
    return '';
  }

  try {
    const binary = atob(value);
    const escaped = Array.from(
      binary,
      (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`,
    );
    return decodeURIComponent(escaped.join(''));
  } catch (error) {
    return value;
  }
};

export default decodeBase64;
