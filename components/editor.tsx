import {
  useRef,
  useState,
  memo,
  FC,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  MouseEvent,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import SunEditorCore from "suneditor/src/lib/core";
import "suneditor/dist/css/suneditor.min.css";
import {
  Button,
  HStack,
  IconButton,
  useTheme,
  useDisclosure,
  Input,
  InputGroup,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  InputRightAddon,
  Radio,
  RadioGroup,
  Stack,
  Box,
  Tooltip,
  Text,
  Select,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import axios, { AxiosResponse } from "axios";
import { csrfToken } from "@config/csrfToken.config";
import { AiOutlineReload, AiOutlineCloseCircle } from "react-icons/ai";
import { IoMdArrowDropdown } from "react-icons/io";
import { RiArrowDownSFill } from "react-icons/ri";
import shallow from "zustand/shallow";
import { useArticle } from "@components/stores";
import { getAccessToken } from "@components/authMethods";
import SharedModal from "@components/modal";
import { Article } from "@models/index";
import { ApiResponse, UploadArticleResult } from "@Types/global";
import { useTags } from "@withSWR/tags";
import { useSingleArticle } from "@withSWR/singleArticle";
import MetaComponent from "@components/meta/metaComponent";
import { useRouter } from "next/router";
import Moment from "react-moment";
import { LoaderContainer, LoaderBody } from "@components/loader";

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

//editor component
const Editor: FC<{ editable: boolean }> = ({ editable }) => {
  if (editable) {
    return <Editable />;
  } else {
    return <NonEditable />;
  }
};

Editor.displayName = "Editor";
//more meta
export const MoreMeta = () => {
  const [isSlug, setIsSlug] = useState(false);
  const articleStore = useArticle((state) => ({ ...state }), shallow);
  const generateSlugHandler = async () => {
    setIsSlug(true);
    const title = articleStore.thumbNail.title;
    const accesstoken = await getAccessToken(csrfToken);
    const {
      data,
    }: AxiosResponse<Omit<ApiResponse, "message"> & { slug: string }> =
      await axios.post("/api/generateSlug", {
        title,
        ...accesstoken,
      });
    const { status, statusCode, slug } = data;

    //storing slug in articleStore;
    if (status && statusCode === 200) {
      articleStore.setSlug(slug);
      setIsSlug(false);
    } else {
      alert(
        "slug is generated from article title which seems to be empty or very short"
      );
      setIsSlug(false);
    }
  };

  const statusHandler = (status: string) => {
    articleStore.setStatus(status as "published" | "unpublished");
  };

  return (
    <>
      {/* auto slug */}
      <FormControl mb="10">
        <FormLabel htmlFor="title" color="gray.600">
          Slug/Public URL
        </FormLabel>
        <InputGroup>
          <Input
            rounded="full"
            _focus={{ outline: "none" }}
            borderRight={"none"}
            spellCheck={false}
            value={articleStore.slug ?? ""}
          />
          <InputRightAddon px={1} bg="transparent" rounded={"full"}>
            <IconButton
              aria-label="auto generate"
              icon={<AiOutlineReload />}
              isLoading={isSlug}
              size="sm"
              rounded="full"
              _focus={{ border: "none" }}
              fontWeight={"semibold"}
              onClick={generateSlugHandler}
              color="gray.500"
            />
          </InputRightAddon>
          <FormErrorMessage>an error message for slug input </FormErrorMessage>
        </InputGroup>
        <FormHelperText>example.com/post/unique-name</FormHelperText>
      </FormControl>
      {/* status */}
      <FormControl mb="10">
        <FormLabel htmlFor="status" color="gray.600">
          Article Status
        </FormLabel>
        <RadioGroup
          id="status"
          value={articleStore.status ?? "unpublished"}
          color="gray.600"
          onChange={statusHandler}
        >
          <Stack direction="row">
            <Radio
              value="published"
              colorScheme={"blue"}
              _focus={{ outline: "none" }}
            >
              Published
            </Radio>
            <Radio
              value="unpublished"
              colorScheme={"pink"}
              _focus={{ outline: "none" }}
            >
              Unpublished
            </Radio>
          </Stack>
        </RadioGroup>
        <FormHelperText>
          Wether the article is visible for the end user to read or not.
        </FormHelperText>
      </FormControl>
      {/* tags */}
      <AddTags />
    </>
  );
};

MoreMeta.displayName = "MoreMeta";

export const AddTags = memo(() => {
  //with tags
  const { data, isError, isLoading } = useTags();

  //store
  const articleStore = useArticle((state) => ({ ...state }), shallow);

  //ref
  const inputElementRef = useRef<HTMLInputElement>(null);
  const selectElementRef = useRef<HTMLSelectElement>(null);

  const onEnterKeyHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter" && inputElementRef.current?.value.trim().length) {
      addTag(inputElementRef.current?.value!);
      inputElementRef.current.value = "";
    }
  };

  const onSelectChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value.length) {
      addTag(e.target.value);
      e.target.value = "";
    }
  };

  const onRemoveTagHandler = (e: MouseEvent<HTMLButtonElement>) => {
    const tag = e.currentTarget.getAttribute("data-tag")!;
    removeTag(tag);
  };

  const addTag = (value: string) => {
    const tags = articleStore.tags;
    if (!tags) {
      articleStore.setTags(new Set([value.trim()]));
    } else {
      articleStore.setTags(
        new Set([...Array.from(tags!.values()), value.trim()])
      );
    }
  };

  const removeTag = (value: string) => {
    const filteredTags = Array.from(articleStore.tags!.values()).filter(
      (val) => val !== value
    );
    articleStore.setTags(new Set(filteredTags));
  };

  return (
    <>
      {/* add tags */}
      <FormControl mb="10">
        <FormLabel htmlFor="title" color="gray.600">
          Tags
        </FormLabel>
        <InputGroup>
          <Input
            rounded="full"
            _focus={{ outline: "none" }}
            borderRight={"none"}
            spellCheck={false}
            onKeyDown={onEnterKeyHandler}
            ref={inputElementRef}
          />
          <InputRightAddon px={1} bg="transparent" rounded={"full"}>
            <Select
              onChange={onSelectChangeHandler}
              ref={selectElementRef}
              size="sm"
              rounded="full"
              _focus={{ border: "none" }}
              color="gray.500"
              placeholder="pick"
              variant={"filled"}
              icon={<IoMdArrowDropdown />}
              fontWeight={"semibold"}
              maxW="20"
            >
              {!isLoading ? (
                data?.tags!.map((val, i) => <option key={i}>{val}</option>)
              ) : (
                <option>loading...</option>
              )}
            </Select>
          </InputRightAddon>
        </InputGroup>
        <FormHelperText>
          New tags are automatically added to tags list
        </FormHelperText>
      </FormControl>
      {/* tags container */}
      {articleStore.tags &&
        Array.from(articleStore.tags.values()).map((val, i) => (
          <Box
            key={i}
            display="inline-flex"
            alignItems={"center"}
            mr="1"
            mb="1"
            bg="green.100"
            pl="3"
            color="green.600"
            fontSize={"sm"}
            fontWeight={"semibold"}
            rounded="full"
          >
            {val}
            <Tooltip
              label={`remove "${val}"`}
              bg="gray.600"
              placement="top"
              arrowSize={7}
              shadow="base"
              px="3"
              fontWeight={"normal"}
            >
              <IconButton
                boxSize={"8"}
                ml="1"
                aria-label="remove tag"
                _focus={{ outline: "none" }}
                _hover={{ bg: "transparent" }}
                _active={{ bg: "transparent" }}
                variant={"outline"}
                border="none"
                size="xs"
                data-tag={val}
                color="green.400"
                icon={<AiOutlineCloseCircle size="18" />}
                onClick={onRemoveTagHandler}
              />
            </Tooltip>
          </Box>
        ))}
    </>
  );
});

AddTags.displayName = "AddTags";

// contextual menu
const ContextualMenu: FC<{
  isPublishable: boolean;
  openModal: () => void;
}> = ({ isPublishable, openModal }) => {
  const articleStore = useArticle((state) => ({ ...state }), shallow);

  return (
    <HStack justifyContent="space-between" p="4" px="5">
      <HStack>
        <Heading as="h2" size="xs" color="beta.gray.600">
          Meta:
        </Heading>
        {articleStore.status === "published" ? (
          <Text fontSize={"md"} color="blue.600">
            Published
          </Text>
        ) : (
          <Text fontSize={"md"} color="red">
            Unpublished
          </Text>
        )}

        <Menu>
          <MenuButton title="show more">
            <IconButton
              size={"xs"}
              variant="outline"
              colorScheme={"gray"}
              aria-label="more article status options"
              icon={<RiArrowDownSFill size={15} />}
              color="beta.gray.400"
            />
          </MenuButton>
          <MenuList zIndex={10}>
            <MenuItem>
              <Heading as="h2" mr={"2"} size="xs" color="beta.gray.600">
                Estimated readTime:
              </Heading>
              <Text fontSize="md">{articleStore.readTime} mins</Text>
            </MenuItem>
            <MenuItem>
              <Heading as="h2" mr={"2"} size="xs" color="beta.gray.600">
                Last updated:
              </Heading>
              <Text fontSize="md">
                {articleStore.updatedAt ? (
                  <Moment format="D MMM YYYY">{articleStore.updatedAt!}</Moment>
                ) : (
                  "Editor's probably empty!"
                )}
              </Text>
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
      <HStack>
        <Button
          py="1"
          _focus={{ outline: "none" }}
          fontWeight="normal"
          colorScheme="twitter"
          disabled={isPublishable}
          onClick={openModal}
          variant="outline"
        >
          {articleStore._id ? "Save changes" : "Save"}
        </Button>
      </HStack>
    </HStack>
  );
};

const Editable = () => {
  //
  //single article state;
  const [shouldFetch, setShouldFetch] = useState(false);
  const [url, setUrl] = useState("");
  const { data, isLoading, isValidating } = useSingleArticle(url, shouldFetch);

  const articleStore = useArticle((state) => ({ ...state }), shallow);
  const fromQuery = useRouter().query.id;
  const router = useRouter();
  const colors = useTheme().colors;
  const editor = useRef<SunEditorCore>();

  // stepper and buttons
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isNextOpen,
    onOpen: onNextOpen,
    onClose: onNextClose,
  } = useDisclosure();

  const [isPublishable, setIsPublishable] = useState<boolean>(true);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  useEffect(() => {
    //make the save button available
    if (articleStore.body) {
      setIsPublishable(false);
    }
    // fetch article by id;
    if (fromQuery?.length) {
      getArticle();
    }
  }, [router]);

  useEffect(() => {
    if (!isLoading && !isValidating) {
      //set article into article store and fill editor's value;
      const { statusCode, status, article } = data!;
      if (statusCode === 302 && status) {
        setIsPublishable(true);
        editor.current?.setContents("");
        editor.current?.insertHTML(article.body);
        const {
          body,
          _id,
          createdAt,
          readTime,
          slug,
          status,
          tags,
          thumbNail,
          updatedAt,
        } = article;
        articleStore.setArticleId(_id);
        articleStore.setArticle({ body, createdAt, readTime, updatedAt });
        articleStore.setSlug(slug);
        articleStore.setStatus(status);
        articleStore.setTags(new Set(tags));
        articleStore.setThumbNailDescription(thumbNail.description);
        articleStore.setThumbNailTitle(thumbNail.title);
        articleStore.setThumbNailPic(thumbNail.headerPic);
      } else {
        router.replace("/admin/create");
      }
    }
  }, [isLoading, isValidating]);

  const getArticle = useCallback(async () => {
    if (fromQuery) {
      try {
        const articleId = fromQuery as any;
        const { token } = await getAccessToken(csrfToken);
        setUrl(
          `/api/getArticle?id=${encodeURIComponent(
            articleId
          )}&&accesstoken=${encodeURIComponent(token)}`
        );
        setShouldFetch(true);
      } catch (error) {
        const err = error as Error;
        alert("generated from getArticle function, ( log it )");
        console.log(err.message);
      }
    } else {
      articleStore.setArticleId(null as any);
    }
  }, [router]);

  const getSunEditorInstance = (sunEditor: SunEditorCore) => {
    editor.current = sunEditor;
  };

  const publishArticle = async () => {
    setIsPublishing(true);
    const { slug, tags, status, _id } = articleStore;
    const body = editor.current?.getText();
    const thumb = articleStore.thumbNail as Article["thumbNail"];
    const isSlug = slug || null;
    const isThumb = !Object.values(thumb).some(
      (v) => v === null || v === undefined || (v as string).length === 0
    );

    const isMeta = isThumb && isSlug && tags?.size && status ? true : false;

    if (isMeta && body) {
      const article: Article = {
        body: editor.current?.getContents(true)!,
        thumbNail: thumb,
        readTime: articleStore.readTime!,
        createdAt: articleStore._id ? articleStore.createdAt! : new Date(),
        updatedAt: new Date(),
        slug: articleStore.slug!,
        status: articleStore.status!,
        tags: articleStore.tags!,
      };
      const { token } = await getAccessToken(csrfToken);
      const formdata = new FormData();

      // append thumbnail data into formdata variable;
      for (let i in article["thumbNail"]) {
        const key = i as keyof Article["thumbNail"];
        const value = article["thumbNail"][key];
        if (key === "headerPic") {
          formdata.append(
            article.thumbNail.headerPic.name || "headerPic",
            value
          );
          continue;
        }
        formdata.append(key, value);
      }

      //append rest of the article fields into formdata variable;
      for (let i in article) {
        const key = i as keyof Article;
        const value = article[key] as string;
        if (key === "tags") {
          formdata.append(
            key,
            JSON.stringify(Array.from(articleStore.tags!.values()))
          );
        }
        if (key !== "thumbNail") {
          formdata.append(key, value);
        }
      }

      //append access token into formdata variable;
      formdata.append("accesstoken", token);

      //set flags for updatable
      if (fromQuery) {
        formdata.append("updatable", "true");
        formdata.append("_id", fromQuery.toString());
      }

      //upload article
      const { status, statusCode, articleInsertionResponse } = (await (
        await axios.post("/api/uploadContent", formdata)
      ).data) as UploadArticleResult;

      //set uploaded article's id into article Store;
      if (status && statusCode === 200 && articleInsertionResponse) {
        setIsPublishing(false);
        articleStore.setArticleId(
          articleInsertionResponse.upsertedId || fromQuery!
        );
      }
    } else {
      alert("meta or body empty");
      setIsPublishing(false);
    }
  };

  const changeHandler = () => {
    const body = editor.current?.getContents(true);
    const chars = editor.current?.getCharCount(body)!;
    const wpm = 1000;
    const isEmpty = !editor.current?.getText().trim().length;
    const time = Math.ceil(chars / wpm);
    if (!isEmpty) {
      articleStore.setArticle({
        body: body!,
        createdAt: articleStore._id ? articleStore.createdAt! : new Date(),
        updatedAt: new Date(),
        readTime: time,
      });
    }
    setIsPublishable(isEmpty);
  };

  if (isLoading) {
    return (
      <LoaderContainer h="90vh">
        <LoaderBody margin="auto" />
      </LoaderContainer>
    );
  }

  return (
    <>
      {/* contextual menu */}
      <ContextualMenu isPublishable={isPublishable} openModal={onOpen} />
      {/* sun editor  */}
      <div className="container">
        <SunEditor
          onImageUploadBefore={(...params) => {
            alert("please upload media from media gallery!");
          }}
          defaultValue={articleStore.body ?? ""}
          onChange={changeHandler}
          getSunEditorInstance={getSunEditorInstance}
          lang={"en"}
          name="sunEditor"
          placeholder="Start writing something..."
          autoFocus={true}
          setDefaultStyle={`font-family: Quicksand; font-weight: 600; font-size: 17px; line-height: 1.5;color:${colors.gray[700]}; overflow: scroll`}
          height="73vh"
          setOptions={{
            shortcutsDisable: ["save"],
            buttonList: [
              ["undo", "redo"],
              ["formatBlock", "fontSize"],
              ["bold", "underline", "italic", "strike", "lineHeight", "link"],
              ["align", "horizontalRule", "list"],
              ["blockquote", "outdent", "indent"],
              ["fontColor", "hiliteColor", "removeFormat"],
              ["table", "imageGallery"],
              ["fullScreen", "showBlocks", "codeView"],
            ],
            stickyToolbar: 1,
            charCounter: true,
            charCounterLabel: "chars:",
            colorList: [...(Object.values(colors.gray) as Array<string>)],
            fontSize: [
              10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
              26, 27, 28, 30,
            ],
            imageGalleryUrl: "/api/imageList",
          }}
        />
        <style jsx global>{`
          .container {
            border: 1px solid ${colors.gray[100]};
            border-radius: 10px;
          }

          .container .sun-editor {
            border: none;
          }
          .container .se-btn-module {
            border: 1px solid ${colors.gray[300]};
            margin: auto 0.1em;
          }
          .container .se-btn-tray {
            background: white;
            align-items: center;
          }

          .container .sun-editor-editable::-webkit-scrollbar {
            display: none;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .container .se-resizing-bar {
            border-top: none;
            padding: 0.5rem;
          }
          .container .sun-editor button > svg {
            fill: ${colors.gray[500]};
            // fill: #546e7a;
            width: 15px;
            height: 15px;
          }
        `}</style>
      </div>
      {/* meta modal */}
      <SharedModal
        animate="slideInRight"
        modalTitle="Meta"
        toggleProps={{ isOpen, onClose }}
        body={<MetaComponent />}
        footer={
          <Box
            borderTop={"1px"}
            w="full"
            borderColor="gray.200"
            textAlign={"right"}
            pt="3"
          >
            <Button
              _focus={{ outline: "none" }}
              colorScheme={"blue"}
              h="8"
              variant="ghost"
              onClick={() => {
                onClose();
                onNextOpen();
              }}
            >
              Next
            </Button>
          </Box>
        }
      />
      {/* more meta modal */}
      <SharedModal
        body={<MoreMeta />}
        modalTitle="Meta"
        toggleProps={{ isOpen: isNextOpen, onClose: onNextClose }}
        size={"lg"}
        animate="slideInRight"
        footer={
          <Box
            borderTop={"1px"}
            w="full"
            borderColor="gray.200"
            textAlign={"right"}
            pt="3"
            display="flex"
            justifyContent="space-between"
          >
            <Button
              _focus={{ outline: "none" }}
              colorScheme={"blue"}
              variant="ghost"
              onClick={() => {
                onOpen();
                onNextClose();
              }}
            >
              Previous
            </Button>
            <Button
              _focus={{ outline: "none" }}
              colorScheme={"blue"}
              fontWeight={"light"}
              onClick={publishArticle}
              isLoading={isPublishing}
              loadingText="Uploading"
            >
              Upload
            </Button>
          </Box>
        }
      />
    </>
  );
};

const NonEditable = () => {
  //
  const articleStore = useArticle((state) => ({ ...state }), shallow);
  const router = useRouter();
  const colors = useTheme().colors;
  const editor = useRef<SunEditorCore>();

  // stepper and buttons
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isNextOpen,
    onOpen: onNextOpen,
    onClose: onNextClose,
  } = useDisclosure();

  const [isPublishable, setIsPublishable] = useState<boolean>(true);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  useEffect(() => {
    //make the save button available
    if (articleStore.body) {
      setIsPublishable(false);
    }
    //remove previous article id if coming from updatable page;
    articleStore.setArticleId(null as any);
  }, []);

  const getSunEditorInstance = (sunEditor: SunEditorCore) => {
    editor.current = sunEditor;
  };

  const publishArticle = async () => {
    setIsPublishing(true);
    const { slug, tags, status, _id } = articleStore;
    const body = editor.current?.getText();
    const thumb = articleStore.thumbNail as Article["thumbNail"];
    const isSlug = slug || null;
    const isThumb = !Object.values(thumb).some(
      (v) => v === null || v === undefined || (v as string).length === 0
    );

    const isMeta = isThumb && isSlug && tags?.size && status ? true : false;

    if (isMeta && body) {
      const article: Article = {
        body: editor.current?.getContents(true)!,
        thumbNail: thumb,
        readTime: articleStore.readTime!,
        createdAt: articleStore._id ? articleStore.createdAt! : new Date(),
        updatedAt: new Date(),
        slug: articleStore.slug!,
        status: articleStore.status!,
        tags: articleStore.tags!,
      };
      const { token } = await getAccessToken(csrfToken);
      const formdata = new FormData();

      // append thumbnail data into formdata variable;
      for (let i in article["thumbNail"]) {
        const key = i as keyof Article["thumbNail"];
        const value = article["thumbNail"][key];
        if (key === "headerPic") {
          formdata.append(
            article.thumbNail.headerPic.name || "headerPic",
            value
          );
          continue;
        }
        formdata.append(key, value);
      }

      //append rest of the article fields into formdata variable;
      for (let i in article) {
        const key = i as keyof Article;
        const value = article[key] as string;
        if (key === "tags") {
          formdata.append(
            key,
            JSON.stringify(Array.from(articleStore.tags!.values()))
          );
        }
        if (key !== "thumbNail") {
          formdata.append(key, value);
        }
      }

      //append access token into formdata variable;
      formdata.append("accesstoken", token);

      //upload article
      const { status, statusCode, articleInsertionResponse } = (await (
        await axios.post("/api/uploadContent", formdata)
      ).data) as UploadArticleResult;

      //set uploaded article's id into article Store;
      if (status && statusCode === 200 && articleInsertionResponse) {
        setIsPublishing(false);
        articleStore.setArticleId(articleInsertionResponse.upsertedId);
        router.replace(
          `/admin/create/${articleInsertionResponse.upsertedId.toString()}`
        );
      }
    } else {
      alert("meta or body empty");
      setIsPublishing(false);
    }
  };

  const changeHandler = () => {
    const body = editor.current?.getContents(true);
    const chars = editor.current?.getCharCount(body)!;
    const wpm = 1000;
    const isEmpty = !editor.current?.getText().trim().length;
    const time = Math.ceil(chars / wpm);
    if (!isEmpty) {
      articleStore.setArticle({
        body: body!,
        createdAt: articleStore._id ? articleStore.createdAt! : new Date(),
        updatedAt: new Date(),
        readTime: time,
      });
    }
    setIsPublishable(isEmpty);
  };

  return (
    <>
      {/* contextual menu */}
      <ContextualMenu isPublishable={isPublishable} openModal={onOpen} />
      {/* sun editor  */}
      <div className="container">
        <SunEditor
          onImageUploadBefore={(...params) => {
            alert("please upload media from media gallery!");
          }}
          defaultValue={articleStore.body ?? ""}
          onChange={changeHandler}
          getSunEditorInstance={getSunEditorInstance}
          lang={"en"}
          name="sunEditor"
          placeholder="Start writing something..."
          autoFocus={true}
          setDefaultStyle={`font-family: Quicksand; font-weight: 600; font-size: 17px; line-height: 1.5;color:${colors.gray[700]}; overflow: scroll`}
          height="73vh"
          setOptions={{
            shortcutsDisable: ["save"],
            buttonList: [
              ["undo", "redo"],
              ["formatBlock", "fontSize"],
              ["bold", "underline", "italic", "strike", "lineHeight", "link"],
              ["align", "horizontalRule", "list"],
              ["blockquote", "outdent", "indent"],
              ["fontColor", "hiliteColor", "removeFormat"],
              ["table", "imageGallery"],
              ["fullScreen", "showBlocks", "codeView"],
            ],
            stickyToolbar: 1,
            charCounter: true,
            charCounterLabel: "chars:",
            colorList: [...(Object.values(colors.gray) as Array<string>)],
            fontSize: [
              10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
              26, 27, 28, 30,
            ],
            imageGalleryUrl: "/api/imageList",
          }}
        />
        <style jsx global>{`
          .container {
            border: 1px solid ${colors.gray[100]};
            border-radius: 10px;
          }

          .container .sun-editor {
            border: none;
          }
          .container .se-btn-module {
            border: 1px solid ${colors.gray[300]};
            margin: auto 0.1em;
          }
          .container .se-btn-tray {
            background: white;
            align-items: center;
          }

          .container .sun-editor-editable::-webkit-scrollbar {
            display: none;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .container .se-resizing-bar {
            border-top: none;
            padding: 0.5rem;
          }
          .container .sun-editor button > svg {
            fill: ${colors.gray[500]};
            // fill: #546e7a;
            width: 15px;
            height: 15px;
          }
        `}</style>
      </div>
      {/* meta modal */}
      <SharedModal
        animate="slideInRight"
        modalTitle="Meta"
        toggleProps={{ isOpen, onClose }}
        body={<MetaComponent />}
        footer={
          <Box
            borderTop={"1px"}
            w="full"
            borderColor="gray.200"
            textAlign={"right"}
            pt="3"
          >
            <Button
              _focus={{ outline: "none" }}
              colorScheme={"blue"}
              h="8"
              variant="ghost"
              onClick={() => {
                onClose();
                onNextOpen();
              }}
            >
              Next
            </Button>
          </Box>
        }
      />
      {/* more meta modal */}
      <SharedModal
        body={<MoreMeta />}
        modalTitle="Meta"
        toggleProps={{ isOpen: isNextOpen, onClose: onNextClose }}
        size={"lg"}
        animate="slideInRight"
        footer={
          <Box
            borderTop={"1px"}
            w="full"
            borderColor="gray.200"
            textAlign={"right"}
            pt="3"
            display="flex"
            justifyContent="space-between"
          >
            <Button
              _focus={{ outline: "none" }}
              colorScheme={"blue"}
              variant="ghost"
              onClick={() => {
                onOpen();
                onNextClose();
              }}
            >
              Previous
            </Button>
            <Button
              _focus={{ outline: "none" }}
              colorScheme={"blue"}
              fontWeight={"light"}
              onClick={publishArticle}
              isLoading={isPublishing}
              loadingText="Uploading"
            >
              Upload
            </Button>
          </Box>
        }
      />
    </>
  );
};

export default memo(Editor);
