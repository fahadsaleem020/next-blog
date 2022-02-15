import { LocalImages } from "@Types/global";
import { createContext, FC, useState, Dispatch, SetStateAction } from "react";

export const ImagesContext = createContext<
  [LocalImages, Dispatch<SetStateAction<LocalImages>>] | undefined
>(undefined);

const ImagesProvider: FC = ({ children }) => {
  const [localImages, setLocalImages] = useState<LocalImages>([]);

  return (
    <ImagesContext.Provider value={[localImages, setLocalImages]}>
      {children}
    </ImagesContext.Provider>
  );
};

export default ImagesProvider;
