import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Image,
  Flex,
  Card,
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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "2xl" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>历史记录详情</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text marginBottom={4}>
              检测时间: {new Date(history.timestamp).toLocaleString()}
            </Text>
            <Text marginBottom={4}>
              检测耗时: {detections.Speed.toFixed(2)} ms
            </Text>
            <Card p={4} marginBottom={4}>
            <Text marginBottom={2}>结节信息:</Text>
            <Text>数量: {detections.Nodules.length}</Text>
            {detections.Nodules.map((nodule, index) => (
              <Flex key={index} marginBottom={4}>
                <Text marginRight={4}>
                  位置: ({nodule.x.toFixed(2)}, {nodule.y.toFixed(2)})
                </Text>
                <Text>
                  大小: {nodule.width.toFixed(2)} x {nodule.height.toFixed(2)}
                </Text>
              </Flex>
            ),)}
            </Card>
            <Flex>
              <div style={{ marginRight: "20px" }}>
                <Text align={"center"}>原始图片</Text>
                <Image
                  src={history.raw_image_url}
                  alt="raw_image"
                  boxSize="200px"
                />
              </div>
              <div style={{ marginRight: "20px" }}>
                <Text align={"center"}>标注图片</Text>
                <Image
                  src={history.annotated_image_url}
                  alt="annotated_image"
                  boxSize="200px"
                />
              </div>
              <div>
                <Text align={"center"}>真实标注图</Text>
                {history.true_labels_url ? (
                  <Image
                    src={history.true_labels_url}
                    alt="true_labels"
                    boxSize="200px"
                  />
                ) : (
                  <Text>暂无真实标注图</Text>
                )}
              </div>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CheckinHistory;
