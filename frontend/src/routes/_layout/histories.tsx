import {
  Container,
  Heading,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Image,
  Text,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

import { HistoriesService } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx";

const historiesSearchSchema = z.object({
  page: z.number().catch(1),
});

export const Route = createFileRoute("/_layout/histories")({
  component: Histories,
  validateSearch: (search) => historiesSearchSchema.parse(search),
});

const PER_PAGE = 10;

function getHistoriesQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      HistoriesService.readHistories({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["histories", { page }],
  };
}

function HistoriesTable() {
  const queryClient = useQueryClient();
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    });

  const {
    data: histories,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getHistoriesQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const hasNextPage = !isPlaceholderData && histories?.data.length === PER_PAGE;
  const hasPreviousPage = page > 1;

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getHistoriesQueryOptions({ page: page + 1 }));
    }
  }, [page, queryClient, hasNextPage]);

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>原始图片</Th>
              <Th>标注图片</Th>
              <Th>真实标注图</Th>
              <Th>检测时间</Th>
              <Th>操作</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(6).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock={"16px"} />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {histories?.data.map((history) => (
                <Tr key={history.id} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Td>{history.id}</Td>
                  <Td>
                    <Image
                      src={history.raw_image_url}
                      alt="raw_image"
                      boxSize="50px"
                    />
                  </Td>
                  <Td>
                    <Image
                      src={history.annotated_image_url}
                      alt="annotated_image"
                      boxSize="50px"
                    />
                  </Td>
                  <Td>
                    {history.true_labels_url ? (
                      <Image
                        src={history.true_labels_url}
                        alt="true_labels"
                        boxSize="50px"
                      />
                    ) : (
                      <Text>暂无真实标注图</Text>
                    )}
                  </Td>
                  <Td>{new Date(history.timestamp).toLocaleString()}</Td>
                  <Td><ActionsMenu type={"History"} value={history} /></Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
      <PaginationFooter
        page={page}
        onChangePage={setPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </>
  );
}

function Histories() {
    return (
        <Container maxW={"full"}>
            <Heading size={"lg"} textAlign={{base: "center", md: "left"}} pt={12}>
                历史记录
            </Heading>
            <HistoriesTable />
        </Container>
    )
}
