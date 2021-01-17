import React, { useState, useEffect } from "react";
import { Card, Container, Header, Icon, Image } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css'

import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:8000"

function App() {
  const [jobs, setJobs] = useState({});

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("FromAPI", data => {
      setJobs(jobs =>  {
        const updatedJobs = Object.fromEntries(data.filter(j =>
          !jobs[j.jobname] // haven't seen it before
          || (jobs[j.jobname].status !== j.status)
        ).map(j => [
          j.jobname, 
          {
            ...j, 
            updatedAt: Date.now(),
          },
        ]));
        return {
          ...jobs,
          ...updatedJobs,
        }
      });
    });
  }, [])

  const sortedJobs = Object.values(jobs).sort((x,y) => y.updatedAt - x.updatedAt);
  return (
    <Container>
      <Header as='h1'>
        JCL Dashboard for Z09347@192.86.32.153
      </Header>
      <Card.Group>
        {sortedJobs.map(j => <JobRow key={j.jobname} job={j} />)}
      </Card.Group>
    </Container>
  );
}

function JobRow({ job }) {
  console.log(job)
  const iconColor = (job.status === 'OUTPUT')
    ? 'black'
    : (job.status === 'ACTIVE')
    ? 'green'
    : 'grey';
  const updatedAtPretty = (new Date(job.updatedAt)).toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
  const [activeIndex, setActiveIndex] = useState(-1);
  const handleClick = (e, titleProps) => {
    const { index } = titleProps;
    setActiveIndex(index === activeIndex ? -1 : index);
  }
  const BLACKLISTED_ATTRS = new Set([
    'updatedAt',
    'job-correlator',
    'files-url',
    'url',
  ]);
  return (
    <Card>
      <Card.Content>
        <Image floated='right'>
          <Icon 
            name='circle' 
            color={iconColor}
            size='large' 
          />
        </Image>
        <Card.Header>
          {job.jobname}
        </Card.Header>
        <Card.Meta>Updated {updatedAtPretty}</Card.Meta>

        {Object.keys(job)
          .filter(x => !BLACKLISTED_ATTRS.has(x))
          .map((title, index) => (
          <JobProperty
            index={index}
            activeIndex={activeIndex}
            handleClick={handleClick}
            title={title}
            content={job[title]}
          />
        ))}
      </Card.Content>
    </Card>
  );
}

function JobProperty({ index, activeIndex, handleClick, title, content }) {
  return (
    <div>
      <Header sub as="span">{title}: </Header>
      <span>{content}</span>
    </div>
  )
}

export default App;
