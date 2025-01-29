import { useState } from "react";
import {
  Box,
  Card,
  Container,
  Text,
  Button,
  Divider,
  Image,
  SimpleGrid,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { FiUploadCloud } from "react-icons/fi";
import {
  IoLocationSharp,
  IoResizeOutline,
  IoPulseOutline,
} from "react-icons/io5";

import { Upload, message } from "antd";
import type { UploadProps } from "antd";
import type { DetectionResponse } from "../../client/types.gen";

export const Route = createFileRoute("/_layout/detect")({ component: Detect });

const props: UploadProps = {
  action: "http://localhost:8000/api/v1/detect/",
  listType: "picture",
  maxCount: 1,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
  beforeUpload: (file) => {
    const isPNG = file.type === "image/png";
    if (!isPNG) {
      message.error(`${file.name} is not a png file`);
    }
    return isPNG || Upload.LIST_IGNORE;
  },
};

function Detect() {
  const [detection, setDetection] = useState<DetectionResponse | null>(null);
  const handleChange = (info: any) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
      console.log("Response: ", info.file.response);
      setDetection(info.file.response);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };
  return (
    <>
      <Container maxW="full">
        <Box pt={12} m={4}>
          <Upload {...props} onChange={handleChange}>
            <Button leftIcon={<FiUploadCloud />}>上传</Button>
          </Upload>
          {detection && (
            <Box mt={4} maxW="1200px" mx="auto" p="6">
              {/* 检测结果标题 */}
              <Box mb={6} textAlign="center">
                <Text fontSize="3xl" fontWeight="bold" mb={2}>
                  <IoPulseOutline
                    size="28px"
                    style={{ display: "inline", marginRight: "8px" }}
                  />
                  检测结果
                </Text>
                <Box fontSize="lg" color="gray.600">
                  检测耗时: <strong>{detection.Speed.toFixed(2)} ms</strong>
                </Box>
                <Box fontSize="lg" color="gray.600">
                  结节数量: <strong>{detection.Nodules.length}</strong>
                </Box>
              </Box>

              {/* 结节信息展示 */}
              {detection.Nodules.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
                  {detection.Nodules.map((nodule, index) => (
                    <Card
                      key={index}
                      p={4}
                      shadow="lg"
                      borderRadius="lg"
                      bg="white"
                      _hover={{ shadow: "xl" }}
                    >
                      {/* 结节标题 */}
                      <Text fontSize="lg" fontWeight="semibold" mb={4}>
                        <IoPulseOutline
                          size="20px"
                          style={{ display: "inline", marginRight: "6px" }}
                        />
                        结节 {index + 1}
                      </Text>
                      <Divider mb={4} />

                      {/* 位置信息 */}
                      <Box display="flex" alignItems="center" mb={3}>
                        <IoLocationSharp
                          size="20px"
                          color="gray"
                          style={{ marginRight: "8px" }}
                        />
                        <Text fontSize="sm" color="gray.500" mr={2}>
                          位置:
                        </Text>
                        <Text fontSize="md">
                          ({nodule.x.toFixed(2)}, {nodule.y.toFixed(2)})
                        </Text>
                      </Box>

                      {/* 大小信息 */}
                      <Box display="flex" alignItems="center">
                        <IoResizeOutline
                          size="20px"
                          color="gray"
                          style={{ marginRight: "8px" }}
                        />
                        <Text fontSize="sm" color="gray.500" mr={2}>
                          大小:
                        </Text>
                        <Text fontSize="md">
                          {nodule.width.toFixed(2)} x {nodule.height.toFixed(2)}
                        </Text>
                      </Box>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <Text fontSize="lg" color="gray.500" textAlign="center" mb={8}>
                  暂无检测到的结节信息。
                </Text>
              )}

              {/* 图片展示 */}
              <Box>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  textAlign="center"
                  mb="6"
                >
                  图片展示
                </Text>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing="6">
                  {/* 图片卡片 1 */}
                  <Box
                    bg="white"
                    shadow="md"
                    rounded="lg"
                    overflow="hidden"
                    _hover={{ shadow: "xl" }}
                  >
                    <Image
                      src={detection.raw_image_url}
                      alt="图片1"
                      objectFit="cover"
                      h="300px"
                      w="100%"
                      border="1px solid #e2e8f0"
                    />
                    <Box p="4">
                      <Text fontSize="lg" fontWeight="semibold">
                        原始图片
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        用户上传的图片
                      </Text>
                    </Box>
                  </Box>
                  {/* 图片卡片 2 */}
                  <Box
                    bg="white"
                    shadow="md"
                    rounded="lg"
                    overflow="hidden"
                    _hover={{ shadow: "xl" }}
                  >
                    <Image
                      src={detection.annotated_image_url}
                      alt="图片2"
                      objectFit="cover"
                      h="300px"
                      w="100%"
                      border="1px solid #e2e8f0"
                    />
                    <Box p="4">
                      <Text fontSize="lg" fontWeight="semibold">
                        标注图片
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        经过模型预测后的图片
                      </Text>
                    </Box>
                  </Box>
                  {/* 图片卡片 3 */}
                  <Box
                    bg="white"
                    shadow="md"
                    rounded="lg"
                    overflow="hidden"
                    _hover={{ shadow: "xl" }}
                  >
                    {detection.true_labels_url ? (
                      <Image
                        src={detection.true_labels_url}
                        alt="图片3"
                        objectFit="cover"
                        h="300px"
                        w="100%"
                        border="1px solid #e2e8f0"
                      />
                    ) : (
                      <Box
                        h="300px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg="gray.100"
                      >
                        <Text color="gray.500">暂无真实标注</Text>
                      </Box>
                    )}

                    <Box p="4">
                      <Text fontSize="lg" fontWeight="semibold">
                        真实标注图片
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        验证集已包含该上传图片
                      </Text>
                    </Box>
                  </Box>
                </SimpleGrid>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
}
