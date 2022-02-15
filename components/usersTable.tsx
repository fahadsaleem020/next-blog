import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  useMediaQuery,
  useTheme,
  Tooltip,
  IconButton,
  Select,
  Skeleton,
  Stack,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import {
  useTable,
  Column,
  useSortBy,
  useGlobalFilter,
  usePagination,
  useRowSelect,
} from "react-table";
import {
  AiOutlineSortAscending,
  AiOutlineSortDescending,
} from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import { HiViewGridAdd } from "react-icons/hi";
import { CgChevronDoubleLeft, CgChevronDoubleRight } from "react-icons/cg";
import AuthenticatedPage from "@components/authenticatedPage";
import { LoaderContainer, LoaderBody } from "@components/loader";
import Moment from "react-moment";
import { useArticles } from "@withSWR/articles";
import SharedModal from "@components/modal";
import { MoreMeta } from "@components/editor";
import MetaComponent from "@components/meta/metaComponent";
import { FC, useMemo, memo, useState } from "react";
import { ArticleDoc } from "@models/index";
import { useArticle } from "@components/stores";
import shallow from "zustand/shallow";
import { MergeId } from "@Types/api";
import { useRouter } from "next/router";

const UsersTable = () => {
  const [hoveredArticle, setHoveredArticle] = useState<ArticleDoc>();
  const { colors } = useTheme();

  //quickEdit states;
  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    isOpen: isNextOpen,
    onOpen: onNextOpen,
    onClose: onNextClose,
  } = useDisclosure();

  // from db
  const { isLoading, isError, data, isValidating } = useArticles();
  const [is800] = useMediaQuery("(max-width: 800px)");

  //table data
  const articleData = useMemo(() => (isLoading ? [] : data!), [data]);
  //table column
  const columns: readonly Column<{}>[] = useMemo(
    () => [
      { Header: "Title", accessor: "thumbNail.title", maxWidth: 80 },
      {
        Header: "Created Date",
        accessor: "createdAt",
        Cell: ({ value }: any) => <Moment format="D MMM YYYY">{value}</Moment>,
      },
      {
        Header: "Updated Date",
        accessor: "updatedAt",
        Cell: ({ value }: any) => <Moment format="D MMM YYYY">{value}</Moment>,
      },
      {
        Header: "Likes",
        accessor: "likes",
        maxWidth: 50,
      },
      {
        Header: "Views",
        accessor: "views",
        Cell: ({ value }: any) => <Text noOfLines={1}>{value}</Text>,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }: any) => (
          <Text
            color={
              value === "unpublished"
                ? "alpha.pinkOne.500"
                : "alpha.azureOne.500"
            }
          >
            {value}
          </Text>
        ),
      },
    ],
    []
  );

  //table hook
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter,
    canNextPage,
    canPreviousPage,
    nextPage,
    previousPage,
    pageCount,
    gotoPage,
    setPageSize,
    selectedFlatRows,
    pageOptions,
    getToggleAllPageRowsSelectedProps,
  } = useTable(
    {
      data: articleData,
      columns,
      initialState: {
        sortBy: [{ id: "status", desc: true }],
        pageSize: 10,
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllPageRowsSelectedProps }) => (
            <input
              style={{ background: "green" }}
              type="checkbox"
              {...getToggleAllPageRowsSelectedProps()}
            />
          ),

          Cell: ({ row }) => (
            <HStack>
              <input
                style={{ display: "inline-block" }}
                type="checkbox"
                {...row.getToggleRowSelectedProps()}
              />
              <Box
                _hover={{ color: "gray.300" }}
                onMouseOver={() => {
                  setHoveredArticle(row.original as any);
                  onOpen();
                }}
              >
                <HiViewGridAdd size={20} />
              </Box>
            </HStack>
          ),
        },
        ...columns,
      ]);
    }
  );

  const { globalFilter, pageIndex, pageSize, selectedRowIds } = state;

  return (
    <>
      <Box
        px="5"
        py="10"
        roundedBottom="3xl"
        roundedTop="xl"
        shadow="base"
        overflowX="auto"
      >
        {isLoading ? (
          <>
            <Stack>
              <Skeleton height="30px" />
              <Skeleton height="30px" />
              <Skeleton height="30px" />
            </Stack>
          </>
        ) : (
          <>
            {/* table contextual menu */}
            <HStack
              position="sticky"
              left={0}
              justifyContent={"space-between"}
              w="full"
              mb="5"
              flexWrap={is800 ? "wrap" : "nowrap"}
            >
              {/* search input */}
              <InputGroup
                w={is800 ? "full" : "40rem"}
                order={is800 ? 2 : "initial"}
                mt={is800 ? "5" : "none"}
              >
                <Input
                  placeholder="Search Term.."
                  _focus={{ border: "1px solid", borderColor: "gray.400" }}
                  bg="gray.50"
                  value={globalFilter || ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
                <InputRightElement
                  pointerEvents="none"
                  color="gray.300"
                  fontSize="1.2em"
                >
                  <FiSearch size="22" />
                </InputRightElement>
              </InputGroup>

              {/* pagination */}
              <HStack
                w="full"
                justifyContent={"end"}
                position={"sticky"}
                left={0}
                top={0}
              >
                <Select
                  w="5rem"
                  defaultChecked={true}
                  defaultValue={pageSize}
                  _focus={{ outline: "none" }}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                  }}
                >
                  {[5, 10, 20, 30, 40].map((val, i) => (
                    <option key={i}>{val}</option>
                  ))}
                </Select>
                <Select
                  w="5rem"
                  defaultChecked={true}
                  defaultValue={pageSize}
                  _focus={{ outline: "none" }}
                  onChange={(e) => {
                    gotoPage(e.target.value ? Number(e.target.value) - 1 : 0);
                  }}
                >
                  {pageOptions.map((val, i) => {
                    return <option key={i}>{val + 1}</option>;
                  })}
                </Select>

                <IconButton
                  _focus={{ outline: "none" }}
                  variant="ghost"
                  title="go to first page"
                  aria-label="first page"
                  onClick={() => gotoPage(0)}
                  disabled={!canPreviousPage}
                  color="gray.500"
                  rounded="full"
                  icon={<CgChevronDoubleLeft size={20} />}
                />
                <IconButton
                  _focus={{ outline: "none" }}
                  colorScheme={"blue"}
                  title="go to previous page"
                  aria-label="previous page"
                  size="sm"
                  rounded={"full"}
                  onClick={previousPage}
                  disabled={!canPreviousPage}
                  icon={<MdKeyboardArrowLeft size={20} />}
                />
                <IconButton
                  _focus={{ outline: "none" }}
                  title="go to next page"
                  aria-label="next page"
                  onClick={nextPage}
                  disabled={!canNextPage}
                  colorScheme={"blue"}
                  size="sm"
                  rounded={"full"}
                  icon={<MdKeyboardArrowRight size={20} />}
                />
                <IconButton
                  variant="ghost"
                  _focus={{ outline: "none" }}
                  title="go to last page"
                  aria-label="last page"
                  onClick={() => gotoPage(pageCount - 1)}
                  disabled={!canNextPage}
                  color="gray.500"
                  rounded="full"
                  icon={<CgChevronDoubleRight size={20} />}
                />
              </HStack>
            </HStack>

            {/* table */}
            <Table {...getTableProps()} bg="white" variant="unstyled">
              <Thead>
                {headerGroups.map((headerGroup, i) => (
                  <Tr {...headerGroup.getHeaderGroupProps()} key={i}>
                    {headerGroup.headers.map((column, i) => (
                      <Th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                        key={i}
                        bg="gray.100"
                      >
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          display="flex"
                          alignItems={"center"}
                        >
                          {column.render("Header")}
                          {typeof column.Header === "string" ? (
                            column.isSorted ? (
                              column.isSortedDesc ? (
                                <AiOutlineSortDescending
                                  size="20"
                                  color={colors.beta.blue[500]}
                                />
                              ) : (
                                <AiOutlineSortAscending
                                  size="20"
                                  color={colors.beta.blue[500]}
                                />
                              )
                            ) : (
                              <AiOutlineSortAscending
                                size="20"
                                color="gainsboro"
                              />
                            )
                          ) : null}
                        </Text>
                      </Th>
                    ))}
                  </Tr>
                ))}
              </Thead>
              <Tbody {...getTableBodyProps()}>
                {page.map((row, i) => {
                  prepareRow(row);
                  return (
                    <Tooltip label="Click to select " key={i}>
                      <Tr
                        {...row.getRowProps()}
                        transition="all 200ms ease"
                        _hover={{
                          shadow: "xl",
                          cursor: "pointer",
                        }}
                      >
                        {row.cells.map((cell, i) => {
                          return (
                            <Td
                              {...cell.getCellProps()}
                              key={i}
                              py="3"
                              onClick={() => cell.row.toggleRowSelected()}
                            >
                              <Text
                                fontWeight={"semibold"}
                                color="gray.500"
                                noOfLines={1}
                                maxW={cell.column.maxWidth}
                              >
                                {cell.render("Cell")}
                              </Text>
                            </Td>
                          );
                        })}
                      </Tr>
                    </Tooltip>
                  );
                })}
              </Tbody>
            </Table>
          </>
        )}
      </Box>

      {!isLoading && (
        <QuickEdit
          article={hoveredArticle!}
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          isNextOpen={isNextOpen}
          onNextOpen={onNextOpen}
          onNextClose={onNextClose}
        />
      )}
    </>
  );
};

const QuickEdit: FC<{
  article: MergeId<ArticleDoc>;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  isNextOpen: boolean;
  onNextOpen: () => void;
  onNextClose: () => void;
}> = memo(
  ({
    article,
    isOpen,
    onClose,
    onOpen,
    isNextOpen,
    onNextClose,
    onNextOpen,
  }) => {
    const articleStore = useArticle((state) => ({ ...state }), shallow);
    const router = useRouter();

    if (!article) return <></>;
    articleStore.setArticleId(article._id as any);
    articleStore.setThumbNailDescription(article.thumbNail!.description);
    articleStore.setThumbNailTitle(article.thumbNail!.title);
    articleStore.setThumbNailPic(article.thumbNail!.headerPic!);
    articleStore.setSlug(article.slug!);
    articleStore.setStatus(article.status!);
    articleStore.setTags(article.tags!);

    const redirectHandler = () => router.push(`/admin/create/${article._id}`);

    return (
      <>
        {/* meta  */}
        <SharedModal
          animate="slideInRight"
          modalTitle="Meta Preview"
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
        {/* more meta */}
        <SharedModal
          body={<MoreMeta />}
          modalTitle="Meta Preview"
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
                onClick={redirectHandler}
              >
                Edit
              </Button>
            </Box>
          }
        />
      </>
    );
  }
);
QuickEdit.displayName = "QuickEdit";

export default UsersTable;
