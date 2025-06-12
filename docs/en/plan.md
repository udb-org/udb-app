# UDB - R&D Plan
## Task List
### Table Structure Design 

#### Loading Process
- [ ] Execute SQL to obtain basic table information, fields, indexes, constraints, etc. (adapted to different databases) and DDL
- [ ] Parse into objects (adapted to different databases)
- [ ] Store DDL and objects in cache
- [ ] Render to page 

#### Basic Modification Process
- [ ] Page editing - including modifying table names, adding columns, editing columns (to adapt to different databases), deleting columns, indexes, constraints, etc.
- [ ] Incremental comparison to form incremental SQL
- [ ] Obtain new DDL (a difficult point)
- [ ] Store DDL in cache 

#### AI Modification Process
- [ ] Obtain incremental SQL from AI dialogue
- [ ] Simulate execution to acquire SQL for basic table information, fields, indexes, constraints, etc. (adapted to different databases) and DDL (difficulty point)
- [ ] Parse into objects (adapted to different databases)
- [ ] Store DDL and objects in cache
- [ ] Render to page 

#### Database Adaptation
- [ ] SQL for querying table information and converting it into a unified table object
- [ ] SQL for querying column information and converting it into a unified table object
- [ ] SQL for querying constraint information and converting it into a unified table object
- [ ] SQL for querying index information and converting it into a unified table object
- [ ] Comparing differences in table objects and generating incremental SQL
- [ ] Querying the actual DDL of a table
- [ ] Querying the DDL after simulating the execution of SQL