import { Box, Container } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { FiUploadCloud } from "react-icons/fi";
import { Button, Upload, message } from "antd";
import type { UploadProps } from "antd";

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
  return (
    <>
      <Container maxW="full">
        <Box pt={12} m={4}>
          <Upload
            {...props}
          >
            <Button type="primary" icon={<FiUploadCloud />}>
              上传
            </Button>
          </Upload>
        </Box>
      </Container>
    </>
  );
}
