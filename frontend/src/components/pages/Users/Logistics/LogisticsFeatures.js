// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   Container,
//   Box,
//   Card,
//   CardContent,
//   CardHeader,
//   Avatar,
//   Icon,
//   Grid,
//   Chip,
//   Divider,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemAvatar,
//   Badge
// } from '@mui/material';
// import logo from '../../../assets/img/navlogo.png';
// import background from '../../../assets/img/background.jpg';

// const LogisticsFeatures = () => {
//   const navigate = useNavigate();

//   // Sample data for upcoming tenders
//   const upcomingTenders = [
//     { id: 1, title: 'Office Supplies Q3', deadline: '2023-08-15', status: 'Pending Approval', category: 'Stationery' },
//     { id: 2, title: 'IT Equipment Upgrade', deadline: '2023-09-01', status: 'Approved', category: 'Electronics' },
//     { id: 3, title: 'Furniture Replacement', deadline: '2023-08-30', status: 'Draft', category: 'Furniture' },
//     { id: 4, title: 'Cleaning Services', deadline: '2023-09-10', status: 'Pending Bids', category: 'Services' },
//   ];

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate('/');
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'Approved': return 'success';
//       case 'Pending Approval': return 'warning';
//       case 'Pending Bids': return 'info';
//       default: return 'default';
//     }
//   };

//   return (
//     <Box sx={{
//       backgroundImage: `url(${background})`,
//       backgroundSize: 'cover',
//       backgroundPosition: 'center',
//       minHeight: '100vh',
//       display: 'flex',
//       flexDirection: 'column'
//     }}>
//       <AppBar position="static" sx={{ backgroundColor: '#253B80' }}>
//         <Toolbar>
//           <img src={logo} alt="Logo" style={{ height: 50 }} />
//           <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} />
//           <Button color="inherit" onClick={() => navigate('/logistics-officer-dashboard')}>Dashboard</Button>
//           <Button color="inherit" onClick={() => navigate('/logistics/orders/tracking')}>Tenders & Orders</Button>
//           <Button color="inherit" onClick={handleLogout}>Logout</Button>
//         </Toolbar>
//       </AppBar>

//       <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
//         <Grid container spacing={3}>
//           {/* Upcoming Tenders Section */}
//           <Grid item xs={12} md={8}>
//             <Card sx={{ borderRadius: 3, height: '100%' }}>
//               <CardHeader
//                 title="Upcoming Tenders"
//                 titleTypographyProps={{ variant: 'h5' }}
//                 avatar={
//                   <Avatar sx={{ bgcolor: '#253B80' }}>
//                     <Icon>event_available</Icon>
//                   </Avatar>
//                 }
//                 action={
//                   <Badge badgeContent={upcomingTenders.length} color="primary">
//                     <Icon>notifications</Icon>
//                   </Badge>
//                 }
//               />
//               <Divider />
//               <CardContent>
//                 <List sx={{ width: '100%' }}>
//                   {upcomingTenders.map((tender) => (
//                     <ListItem 
//                       key={tender.id} 
//                       secondaryAction={
//                         <Chip 
//                           label={tender.status} 
//                           color={getStatusColor(tender.status)} 
//                           size="small" 
//                         />
//                       }
//                       sx={{
//                         mb: 1,
//                         backgroundColor: '#f5f5f5',
//                         borderRadius: 1,
//                         '&:hover': { backgroundColor: '#e0e0e0' }
//                       }}
//                     >
//                       <ListItemAvatar>
//                         <Avatar sx={{ bgcolor: '#253B80' }}>
//                           <Icon>description</Icon>
//                         </Avatar>
//                       </ListItemAvatar>
//                       <ListItemText
//                         primary={tender.title}
//                         secondary={`Deadline: ${tender.deadline} | Category: ${tender.category}`}
//                       />
//                     </ListItem>
//                   ))}
//                 </List>
//               </CardContent>
//             </Card>
//           </Grid>

//           {/* Quick Actions Section */}
//           <Grid item xs={12} md={4}>
//             <Card sx={{ borderRadius: 3, height: '100%' }}>
//               <CardHeader
//                 title="Quick Actions"
//                 titleTypographyProps={{ variant: 'h5' }}
//                 avatar={
//                   <Avatar sx={{ bgcolor: '#253B80' }}>
//                     <Icon>bolt</Icon>
//                   </Avatar>
//                 }
//               />
//               <Divider />
//               <CardContent>
//                 <Grid container spacing={2}>
//                   {[
//                     { icon: 'add', label: 'Create New Tender', action: () => console.log('Create') },
//                     { icon: 'search', label: 'View Past Tenders', action: () => console.log('View') },
//                     { icon: 'assessment', label: 'Generate Report', action: () => console.log('Report') },
//                     { icon: 'settings', label: 'Settings', action: () => console.log('Settings') }
//                   ].map((action, index) => (
//                     <Grid item xs={6} key={index}>
//                       <Button
//                         fullWidth
//                         variant="outlined"
//                         startIcon={<Icon>{action.icon}</Icon>}
//                         onClick={action.action}
//                         sx={{
//                           p: 2,
//                           height: '100%',
//                           justifyContent: 'flex-start',
//                           textAlign: 'left'
//                         }}
//                       >
//                         {action.label}
//                       </Button>
//                     </Grid>
//                   ))}
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>

//           {/* Statistics Section */}
//           <Grid item xs={12}>
//             <Card sx={{ borderRadius: 3 }}>
//               <CardHeader
//                 title="Tender Statistics"
//                 titleTypographyProps={{ variant: 'h5' }}
//                 avatar={
//                   <Avatar sx={{ bgcolor: '#253B80' }}>
//                     <Icon>bar_chart</Icon>
//                   </Avatar>
//                 }
//               />
//               <Divider />
//               <CardContent>
//                 <Grid container spacing={3} sx={{ textAlign: 'center' }}>
//                   {[
//                     { value: '12', label: 'Active Tenders', icon: 'assignment', color: 'primary' },
//                     { value: '5', label: 'Pending Approval', icon: 'hourglass_empty', color: 'warning' },
//                     { value: '23', label: 'Completed', icon: 'check_circle', color: 'success' },
//                     { value: '3', label: 'Overdue', icon: 'error', color: 'error' }
//                   ].map((stat, index) => (
//                     <Grid item xs={12} sm={6} md={3} key={index}>
//                       <Box sx={{ p: 2 }}>
//                         <Avatar sx={{ 
//                           bgcolor: `${stat.color}.main`, 
//                           width: 60, 
//                           height: 60,
//                           mb: 2,
//                           mx: 'auto'
//                         }}>
//                           <Icon sx={{ fontSize: 30 }}>{stat.icon}</Icon>
//                         </Avatar>
//                         <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stat.value}</Typography>
//                         <Typography variant="subtitle1">{stat.label}</Typography>
//                       </Box>
//                     </Grid>
//                   ))}
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// };

// export default LogisticsFeatures;