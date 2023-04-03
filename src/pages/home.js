import React, { useEffect, useContext, useState } from "react";
import Layout from "@/components/layout";
import {
  Box,
  HStack,
  Divider,
  Flex,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tabs,
  Spinner,
} from "@chakra-ui/react";
import MyFiles from "@/components/myFiles";
import SharedWithMe from "@/components/sharedWithMe";
import { User_data } from "@/contexts/userContexts";
import { useRouter } from "next/router";
import { Polybase } from "@polybase/client";

const db = new Polybase({
  defaultNamespace:
    "pk/0x326b3a6fb1871737ec1f73662e3b3f51e797010027f66fc840a6b4dfe2de4d1511bf14c0e1b64b878886be17ba3a855b0dbdf2cd1d3962b6ebb7c25beb124e6b/pixie3",
});

export default function SidebarWithHeader({ children }) {
  const { user, setUser } = useContext(User_data);
  const [files, setFiles] = useState([]);
  const [sharedFile, setSharedFIle] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function loadFiles(userId) {
    setLoading(true);
    console.log("loading files at homepage....");
    const recordData = await db.collection("User").record(userId).get();
    console.log("fetched user at /home", recordData.data);
    setUser(recordData.data);
    setFiles(recordData.data.files);
    setSharedFIle(recordData.data.sharedWithMe);
    setLoading(false);
  }

  useEffect(() => {
    if (!user) {
      console.log("You are not signed in");
      router.push("/");
      return;
    }
    loadFiles(user.id);
  }, []);

  return (
    <Layout setFiles={setFiles}>
      <Box>
        <HStack direction="row" h="auto" p={1} spacing="24px" align={"top"}>
          <Flex direction="column"></Flex>
          <Divider orientation="vertical" />
          <Flex width="100%">
            <Tabs
              size="lg"
              variant="soft-rounded"
              colorScheme="green"
              width="100%"
            >
              <TabList>
                <Tab>My Files</Tab>
                <Tab>Shared With Me</Tab>
              </TabList>
              <br></br>
              <Flex justifyContent="center">
                {loading ? (
                  <Spinner></Spinner>
                ) : (
                  <TabPanels>
                    <TabPanel bg="gray.100">
                      <MyFiles files={files} setFiles={setFiles} />
                    </TabPanel>
                    <TabPanel bg="gray.100">
                      <SharedWithMe fileIds={sharedFile} />
                    </TabPanel>
                  </TabPanels>
                )}
              </Flex>
            </Tabs>
          </Flex>
        </HStack>
      </Box>
    </Layout>
  );
}
