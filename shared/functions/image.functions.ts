export const convertBase64ContentToUri = (base64content: string): string => {
  const firstSymbol = base64content[0];
  const image = "data:image/";

  switch (firstSymbol) {
    case "/": {
      return `${image}jpeg;base64,${base64content}`;
    }

    case "i": {
      return `${image}png;base64,${base64content}`;
    }

    case "R": {
      return `${image}gif;base64,${base64content}`;
    }

    case "U": {
      return `${image}webp;base64,${base64content}`;
    }

    case "P": {
      return `${image}svg+xml;base64,${base64content}`;
    }

    default: {
      return;
    }
  }
};
