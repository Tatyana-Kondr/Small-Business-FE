export type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const createImage = (
  url: string
): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener(
      "load",
      () => resolve(image)
    );

    image.addEventListener(
      "error",
      (error) => reject(error)
    );

    image.setAttribute(
      "crossOrigin",
      "anonymous"
    );

    image.src = url;
  });


const getRadianAngle = (
  degreeValue: number
) => {
  return (
    (degreeValue * Math.PI) /
    180
  );
};


const rotateSize = (
  width: number,
  height: number,
  rotation: number
) => {
  const rotRad =
    getRadianAngle(rotation);

  return {
    width:
      Math.abs(
        Math.cos(rotRad) * width
      ) +
      Math.abs(
        Math.sin(rotRad) * height
      ),

    height:
      Math.abs(
        Math.sin(rotRad) * width
      ) +
      Math.abs(
        Math.cos(rotRad) * height
      ),
  };
};


export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {

  const image =
    await createImage(imageSrc);

  const canvas =
    document.createElement("canvas");

  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "Canvas konnte nicht erstellt werden"
    );
  }

  const rotRad =
    getRadianAngle(rotation);

  const {
    width: boundingBoxWidth,
    height: boundingBoxHeight,
  } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width =
    boundingBoxWidth;

  canvas.height =
    boundingBoxHeight;

  ctx.translate(
    boundingBoxWidth / 2,
    boundingBoxHeight / 2
  );

  ctx.rotate(rotRad);

  ctx.translate(
    -image.width / 2,
    -image.height / 2
  );

  ctx.drawImage(
    image,
    0,
    0
  );

  const croppedCanvas =
    document.createElement("canvas");

  const croppedCtx =
    croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    throw new Error(
      "Crop-Canvas konnte nicht erstellt werden"
    );
  }

  croppedCanvas.width =
    pixelCrop.width;

  croppedCanvas.height =
    pixelCrop.height;

  croppedCtx.drawImage(
    canvas,

    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,

    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
      croppedCanvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Foto konnte nicht verarbeitet werden"
              )
            );
            return;
          }

          resolve(blob);
        },

        "image/jpeg",
        0.9
      );
    }
  );
}