import UsersTable from "@components/usersTable";
import { NextPage } from "next";
import { Box, HStack, Heading, Text } from "@chakra-ui/react";
import { ResponsiveContainer, PieChart, Pie, Sector } from "recharts";
import { useState } from "react";
import { useArticles } from "@withSWR/articles";
import Admin from "@components/adminLayout";

const PostsPage: NextPage = () => {
  const { data, isLoading, isError, isValidating } = useArticles();
  return (
    <Admin>
      <Box p={5} maxW={1800}>
        <HStack
          shadow="base"
          justifyContent={"space-between"}
          rounded={"3xl"}
          overflow={"hidden"}
        >
          <Box display="flex" w="full" pl="5">
            <Box>
              <Heading as="h1" size={"sm"} color="beta.gray.400">
                Total published:
              </Heading>
              <Text fontSize={"2xl"} fontWeight={"bold"} color="blue.700">
                {data?.filter((val) => val.status === "published").length}
              </Text>
            </Box>
            <Box m="auto">
              <Heading as="h1" size={"sm"} color="beta.gray.400">
                Total Unpublished:
              </Heading>
              <Text fontSize={"2xl"} fontWeight={"bold"} color="blue.700">
                {data?.filter((val) => val.status === "unpublished").length}
              </Text>
            </Box>
          </Box>
          <Box height={"250px"} width="400px" bg="gray.50">
            <SimpleInsight />
          </Box>
        </HStack>
      </Box>
      <Box maxW={1800} p={5}>
        <UsersTable />
      </Box>
    </Admin>
  );
};

const SimpleInsight = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const { isLoading, isError, data, isValidating } = useArticles();

  if (isLoading) return <></>;

  const totalPublished = data?.filter(
    (val) => val.status === "published"
  ).length;
  const totalUnpublished = data?.filter(
    (val) => val.status === "unpublished"
  ).length;

  const values = [
    { name: "Published", value: totalPublished },
    { name: "unPublished", value: totalUnpublished },
  ];
  const handler = (_: any, index: any) => {
    setActiveIndex(index as number);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart width={730} height={250}>
        <Pie
          activeIndex={activeIndex}
          data={values}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={70}
          fill="#8884d8"
          activeShape={renderActiveShape}
          onMouseEnter={handler}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={14}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`${value}`}</text>
    </g>
  );
};

export default PostsPage;
