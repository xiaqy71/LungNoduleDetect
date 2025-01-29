import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  Card,
  Grid,
  GridItem,
  Image,
  Flex,
  Stack,
  Box,
} from "@chakra-ui/react";

import { type HistoryPublic } from "../../client";

interface EditItemProps {
  history: HistoryPublic;
  isOpen: boolean;
  onClose: () => void;
}

interface Nodule {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

interface Detection {
  Speed: number;
  Nodules: Nodule[];
}

const CheckinHistory = ({ history, isOpen, onClose }: EditItemProps) => {
  const detections: Detection = JSON.parse(history.detections);

  return (
    <>
<Modal isOpen={isOpen} onClose={onClose} size={{ base: "sm", md: "2xl" }} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>历史记录详情</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {/* 显示检测时间和耗时 */}
          <Stack spacing={4}>
            <Text>
              检测时间: {new Date(history.timestamp).toLocaleString()}
            </Text>
            <Text>
              检测耗时: {detections.Speed.toFixed(2)} ms
            </Text>

            {/* 显示结节信息 */}
            <Card p={4} marginBottom={4} boxShadow="md" borderRadius="md">
              <Text fontWeight="semibold" marginBottom={2}>
                结节信息:
              </Text>
              <Text>数量: {detections.Nodules.length}</Text>
              {detections.Nodules.map((nodule, index) => (
                <Flex key={index} direction="column" marginBottom={4}>
                  <Text>位置: ({nodule.x.toFixed(2)}, {nodule.y.toFixed(2)})</Text>
                  <Text>大小: {nodule.width.toFixed(2)} x {nodule.height.toFixed(2)}</Text>
                </Flex>
              ))}
            </Card>

            {/* 图片展示 */}
            <Grid
              templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
              gap={4}
              justifyContent="start"
              alignItems="center"
            >
              {/* 原始图片 */}
              <GridItem colSpan={1}>
                <Text align="center" fontWeight="semibold">原始图片</Text>
                <Box
                  bg="white"
                  shadow="sm"
                  borderRadius="md"
                  overflow="hidden"
                  _hover={{ shadow: "lg" }}
                >
                  <Image
                    src={history.raw_image_url}
                    alt="原始图片"
                    objectFit="cover"
                    height="250px"
                    width="100%"
                  />
                </Box>
              </GridItem>

              {/* 标注图片 */}
              <GridItem colSpan={1}>
                <Text align="center" fontWeight="semibold">标注图片</Text>
                <Box
                  bg="white"
                  shadow="sm"
                  borderRadius="md"
                  overflow="hidden"
                  _hover={{ shadow: "lg" }}
                >
                  <Image
                    src={history.annotated_image_url}
                    alt="标注图片"
                    objectFit="cover"
                    height="250px"
                    width="100%"
                  />
                </Box>
              </GridItem>

              {/* 真实标注图片 */}
              <GridItem colSpan={1}>
                <Text align="center" fontWeight="semibold">真实标注图片</Text>
                {history.true_labels_url ? (
                  <Box
                    bg="white"
                    shadow="sm"
                    borderRadius="md"
                    overflow="hidden"
                    _hover={{ shadow: "lg" }}
                  >
                    <Image
                      src={history.true_labels_url}
                      alt="真实标注图片"
                      objectFit="cover"
                      height="250px"
                      width="100%"
                    />
                  </Box>
                ) : (
                  <Text align="center" color="gray.500">无真实标注</Text>
                )}
              </GridItem>
            </Grid>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
    </>
  );
};

export default CheckinHistory;
