import { useState } from "react";
import {
  Box,
  Card,
  color,
  Container,
  Text,
  Button,
  Flex,
  Image,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { FiUploadCloud } from "react-icons/fi";
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
            <Box mt={4}>
              <Box>
                <Text fontSize={"xl"}>检测结果</Text>
                <Box>检测耗时: {detection.Speed.toFixed(2)} ms</Box>
                <Box>
                  {detection.Nodules.map((nodule, index) => (
                    <Box key={index}>
                      <Card p={4} mt={4} maxWidth={400}>
                        <Box>
                          {" "}
                          位置: ({nodule.x.toFixed(2)}, {nodule.y.toFixed(2)})
                        </Box>
                        <Box>
                          {" "}
                          大小：{nodule.width.toFixed(2)} x{" "}
                          {nodule.height.toFixed(2)}
                        </Box>
                      </Card>
                    </Box>
                  ))}
                </Box>
                <Box>
                  <Flex mt={4}>
                    <div style={{ marginRight: "20px" }}>
                      <Text align={"center"}>原始图片</Text>
                      <Image src={detection.raw_image_url}></Image>
                    </div>
                    <div style={{ marginRight: "20px" }}>
                      <Text align={"center"}>标注图片</Text>
                      <Image src={detection.annotated_image_url}></Image>
                    </div>
                    <div>
                      <Text align={"center"}>标注图片</Text>
                      <Image src={detection.annotated_image_url}></Image>
                    </div>
                  </Flex>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
}
