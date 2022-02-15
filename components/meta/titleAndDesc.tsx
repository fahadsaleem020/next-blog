import {
  InputGroup,
  Input,
  FormControl,
  FormHelperText,
  FormLabel,
  Textarea,
  FormErrorMessage,
} from "@chakra-ui/react";
import { ChangeEvent, FC, memo } from "react";
import { ArticleType } from "@Types/global";

interface Props {
  articleStore: ArticleType;
  isLength: { isDesc: boolean; isTitle: boolean };
  setTitleAndDesc: (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    type: "title" | "description"
  ) => void;
}

const TitleAndDec: FC<Props> = ({
  articleStore,
  setTitleAndDesc,
  isLength,
}) => {
  return (
    <>
      <InputGroup mb="10">
        <FormControl isInvalid={isLength.isTitle}>
          <FormLabel htmlFor="title" color="gray.500">
            Title
          </FormLabel>
          <Input
            spellCheck={false}
            defaultValue={articleStore.thumbNail.title ?? ""}
            id="title"
            border="1px solid"
            borderColor="gray.200"
            _focus={{ outline: "none" }}
            onChange={(e) => setTitleAndDesc(e, "title")}
          />
          <FormErrorMessage>
            That&apos;s too big a title please keep it short and relevant
          </FormErrorMessage>
        </FormControl>
      </InputGroup>
      <InputGroup mb="10">
        <FormControl isInvalid={isLength.isDesc}>
          <FormLabel htmlFor="description" color="gray.500">
            Brief Description
          </FormLabel>
          <Textarea
            defaultValue={articleStore.thumbNail.description ?? ""}
            onChange={(e) => setTitleAndDesc(e, "description")}
            id="description"
            spellCheck={false}
            border="1px solid"
            borderColor="gray.200"
            _focus={{ outline: "none" }}
          />
          <FormHelperText>
            Appears in thumbnail and article reading page.
          </FormHelperText>
          <FormErrorMessage>
            please keep it short and relevant.
          </FormErrorMessage>
        </FormControl>
      </InputGroup>
    </>
  );
};

export default memo(TitleAndDec);
