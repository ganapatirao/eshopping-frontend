export const indianStates = [
  { code: 'MH', name: 'Maharashtra' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'DL', name: 'Delhi' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'WB', name: 'West Bengal' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'PB', name: 'Punjab' },
  { code: 'HR', name: 'Haryana' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'TG', name: 'Telangana' },
  { code: 'KL', name: 'Kerala' },
  { code: 'OR', name: 'Odisha' },
  { code: 'BR', name: 'Bihar' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'CH', name: 'Chhattisgarh' },
  { code: 'UK', name: 'Uttarakhand' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'JK', name: 'Jammu & Kashmir' },
  { code: 'GA', name: 'Goa' },
  { code: 'AS', name: 'Assam' },
  { code: 'MN', name: 'Manipur' },
  { code: 'MZ', name: 'Mizoram' },
  { code: 'NL', name: 'Nagaland' },
  { code: 'TR', name: 'Tripura' },
  { code: 'ML', name: 'Meghalaya' },
  { code: 'SK', name: 'Sikkim' },
  { code: 'AR', name: 'Arunachal Pradesh' },
];

export const stateDistricts = {
  'MH': [
    { name: 'Mumbai City', cities: ['Mumbai', 'Churchgate', 'Dadar', 'Andheri', 'Bandra', 'Juhu'] },
    { name: 'Mumbai Suburban', cities: ['Thane', 'Navi Mumbai', 'Kalyan', 'Dombivli', 'Ulhasnagar'] },
    { name: 'Pune', cities: ['Pune', 'Pimpri-Chinchwad', 'Lonavala', 'Khadki'] },
    { name: 'Nagpur', cities: ['Nagpur', 'Kamptee', 'Hingna', 'Umred'] },
    { name: 'Nashik', cities: ['Nashik', 'Malegaon', 'Manmad', 'Sinnar'] },
    { name: 'Aurangabad', cities: ['Aurangabad', 'Jalna', 'Paithan', 'Sillod'] },
    { name: 'Kolhapur', cities: ['Kolhapur', 'Ichalkaranji', 'Jaysingpur', 'Ratnagiri'] },
  ],
  'KA': [
    { name: 'Bangalore Urban', cities: ['Bangalore', 'Whitefield', 'Electronic City', 'Yelahanka', 'BTM Layout'] },
    { name: 'Bangalore Rural', cities: ['Nelamangala', 'Devanahalli', 'Hoskote', 'Magadi'] },
    { name: 'Mysore', cities: ['Mysore', 'Mandya', 'Chamarajanagar', 'Nanjangud'] },
    { name: 'Hubli-Dharwad', cities: ['Hubli', 'Dharwad', 'Belgaum', 'Gadag'] },
    { name: 'Mangalore', cities: ['Mangalore', 'Udupi', 'Manipal', 'Puttur'] },
    { name: 'Kalaburagi', cities: ['Kalaburagi', 'Bidar', 'Raichur', 'Yadgir'] },
  ],
  'TN': [
    { name: 'Chennai', cities: ['Chennai', 'Ambattur', 'Avadi', 'Tambaram', 'Madhavaram'] },
    { name: 'Coimbatore', cities: ['Coimbatore', 'Tiruppur', 'Erode', 'Salem'] },
    { name: 'Madurai', cities: ['Madurai', 'Dindigul', 'Theni', 'Ramanathapuram'] },
    { name: 'Tiruchirappalli', cities: ['Tiruchirappalli', 'Karur', 'Perambalur', 'Ariyalur'] },
    { name: 'Salem', cities: ['Salem', 'Namakkal', 'Dharmapuri', 'Krishnagiri'] },
    { name: 'Kanchipuram', cities: ['Kanchipuram', 'Chengalpattu', 'Tiruvallur', 'Vellore'] },
  ],
  'DL': [
    { name: 'Central Delhi', cities: ['Connaught Place', 'Karol Bagh', 'Chandni Chowk', 'Daryaganj'] },
    { name: 'New Delhi', cities: ['India Gate', 'Chanakyapuri', 'Diplomatic Enclave', 'Rashtrapati Bhavan'] },
    { name: 'South Delhi', cities: ['Saket', 'Hauz Khas', 'Greater Kailash', 'Defence Colony'] },
    { name: 'East Delhi', cities: ['Mayur Vihar', 'Preet Vihar', 'Laxmi Nagar', 'Shahdara'] },
    { name: 'North Delhi', cities: ['Civil Lines', 'Kashmere Gate', 'Model Town', 'Rohini'] },
    { name: 'West Delhi', cities: ['Rajouri Garden', 'Punjabi Bagh', 'Janakpuri', 'Dwarka'] },
    { name: 'North East Delhi', cities: ['Seelampur', 'Welcome', 'Mustafabad', 'Karawal Nagar'] },
    { name: 'North West Delhi', cities: ['Pitampura', 'Rohini', 'Bawana', 'Narela'] },
    { name: 'South West Delhi', cities: ['Vasant Kunj', 'Mahipalpur', 'Dwarka Sector 23', 'Chhawla'] },
  ],
  'GJ': [
    { name: 'Ahmedabad', cities: ['Ahmedabad', 'Gandhinagar', 'Kalol', 'Dehgam'] },
    { name: 'Surat', cities: ['Surat', 'Navsari', 'Bardoli', 'Vyara'] },
    { name: 'Vadodara', cities: ['Vadodara', 'Anand', 'Nadiad', 'Petlad'] },
    { name: 'Rajkot', cities: ['Rajkot', 'Jamnagar', 'Junagadh', 'Porbandar'] },
    { name: 'Bhavnagar', cities: ['Bhavnagar', 'Amreli', 'Bhuj', 'Mandvi'] },
  ],
  'UP': [
    { name: 'Lucknow', cities: ['Lucknow', 'Kanpur', 'Unnao', 'Barabanki'] },
    { name: 'Agra', cities: ['Agra', 'Mathura', 'Firozabad', 'Mainpuri'] },
    { name: 'Varanasi', cities: ['Varanasi', 'Mirzapur', 'Ghazipur', 'Jaunpur'] },
    { name: 'Prayagraj', cities: ['Prayagraj', 'Kaushambi', 'Pratapgarh', 'Sultanpur'] },
    { name: 'Meerut', cities: ['Meerut', 'Ghaziabad', 'Baghpat', 'Hapur'] },
    { name: 'Noida', cities: ['Noida', 'Greater Noida', 'Gautam Buddh Nagar', 'Yamuna Expressway'] },
    { name: 'Gorakhpur', cities: ['Gorakhpur', 'Deoria', 'Basti', 'Sant Kabir Nagar'] },
  ],
  'WB': [
    { name: 'Kolkata', cities: ['Kolkata', 'Howrah', 'Salt Lake', 'Dum Dum', 'Baranagar'] },
    { name: 'North 24 Parganas', cities: ['Barrackpore', 'Dum Dum', 'Khardaha', 'Barasat'] },
    { name: 'South 24 Parganas', cities: ['Behala', 'Thakurpukur', 'Maheshtala', 'Budge Budge'] },
    { name: 'Darjeeling', cities: ['Darjeeling', 'Siliguri', 'Kurseong', 'Kalimpong'] },
    { name: 'Hooghly', cities: ['Chinsurah', 'Serampore', 'Chandannagar', 'Arambagh'] },
    { name: 'Howrah', cities: ['Howrah', 'Uluberia', 'Bally', 'Shibpur'] },
  ],
  'RJ': [
    { name: 'Jaipur', cities: ['Jaipur', 'Ajmer', 'Tonk', 'Sikar'] },
    { name: 'Jodhpur', cities: ['Jodhpur', 'Pali', 'Barmer', 'Jalore'] },
    { name: 'Udaipur', cities: ['Udaipur', 'Rajsamand', 'Chittorgarh', 'Banswara'] },
    { name: 'Kota', cities: ['Kota', 'Bundi', 'Baran', 'Jhalawar'] },
    { name: 'Bikaner', cities: ['Bikaner', 'Ganganagar', 'Hanumangarh', 'Churu'] },
    { name: 'Ajmer', cities: ['Ajmer', 'Bhilwara', 'Nagaur', 'Tonk'] },
  ],
  'MP': [
    { name: 'Bhopal', cities: ['Bhopal', 'Sehore', 'Raisen', 'Vidisha'] },
    { name: 'Indore', cities: ['Indore', 'Dewas', 'Ujjain', 'Shajapur'] },
    { name: 'Jabalpur', cities: ['Jabalpur', 'Katni', 'Mandla', 'Seoni'] },
    { name: 'Gwalior', cities: ['Gwalior', 'Morena', 'Shivpuri', 'Bhind'] },
    { name: 'Sagar', cities: ['Sagar', 'Chhatarpur', 'Damoh', 'Panna'] },
  ],
  'PB': [
    { name: 'Ludhiana', cities: ['Ludhiana', 'Jalandhar', 'Patiala', 'Amritsar'] },
    { name: 'Amritsar', cities: ['Amritsar', 'Tarn Taran', 'Gurdaspur', 'Pathankot'] },
    { name: 'Patiala', cities: ['Patiala', 'Sangrur', 'Bathinda', 'Mansa'] },
    { name: 'Jalandhar', cities: ['Jalandhar', 'Kapurthala', 'Hoshiarpur', 'Nawanshahr'] },
  ],
  'HR': [
    { name: 'Gurgaon', cities: ['Gurgaon', 'Faridabad', 'Nuh', 'Palwal'] },
    { name: 'Ambala', cities: ['Ambala', 'Karnal', 'Panipat', 'Yamunanagar'] },
    { name: 'Hisar', cities: ['Hisar', 'Bhiwani', 'Hansi', 'Fatehabad'] },
    { name: 'Rohtak', cities: ['Rohtak', 'Jhajjar', 'Sonipat', 'Bahadurgarh'] },
  ],
  'AP': [
    { name: 'Visakhapatnam', cities: ['Visakhapatnam', 'Vizianagaram', 'Srikakulam', 'Anakapalle'] },
    { name: 'Amaravati', cities: ['Amaravati', 'Guntur', 'Vijayawada', 'Mangalagiri'] },
    { name: 'Tirupati', cities: ['Tirupati', 'Chittoor', 'Madanapalle', 'Srikalahasti'] },
    { name: 'Kakinada', cities: ['Kakinada', 'Rajahmundry', 'Amalapuram', 'Peddapuram'] },
  ],
  'TG': [
    { name: 'Hyderabad', cities: ['Hyderabad', 'Secunderabad', 'Medchal', 'LB Nagar'] },
    { name: 'Warangal', cities: ['Warangal', 'Hanamkonda', 'Kazipet', 'Jangaon'] },
    { name: 'Nizamabad', cities: ['Nizamabad', 'Kamareddy', 'Bodhan', 'Armoor'] },
    { name: 'Karimnagar', cities: ['Karimnagar', 'Ramagundam', 'Peddapalli', 'Jagtial'] },
  ],
  'KL': [
    { name: 'Thiruvananthapuram', cities: ['Thiruvananthapuram', 'Neyyattinkara', 'Attingal', 'Varkala'] },
    { name: 'Kochi', cities: ['Kochi', 'Ernakulam', 'Aluva', 'Kalamassery'] },
    { name: 'Kozhikode', cities: ['Kozhikode', 'Malappuram', 'Koyilandy', 'Vadakara'] },
    { name: 'Thrissur', cities: ['Thrissur', 'Guruvayur', 'Chavakkad', 'Irinjalakuda'] },
  ],
  'OR': [
    { name: 'Khordha', cities: ['Bhubaneswar', 'Cuttack', 'Puri', 'Khordha'] },
    { name: 'Ganjam', cities: ['Berhampur', 'Chhatrapur', 'Gopalpur', 'Asika'] },
    { name: 'Cuttack', cities: ['Cuttack', 'Barabati', 'Choudwar', 'Naraj'] },
    { name: 'Sambalpur', cities: ['Sambalpur', 'Jharsuguda', 'Bargarh', 'Bolangir'] },
  ],
  'BR': [
    { name: 'Patna', cities: ['Patna', 'Hajipur', 'Danapur', 'Phulwari Sharif'] },
    { name: 'Gaya', cities: ['Gaya', 'Bodh Gaya', 'Nawada', 'Jehanabad'] },
    { name: 'Muzaffarpur', cities: ['Muzaffarpur', 'Vaishali', 'Sitamarhi', 'Sheohar'] },
    { name: 'Bhagalpur', cities: ['Bhagalpur', 'Banka', 'Jamui', 'Munger'] },
  ],
  'JH': [
    { name: 'Ranchi', cities: ['Ranchi', 'Khunti', 'Ramgarh', 'Bokaro'] },
    { name: 'Jamshedpur', cities: ['Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh'] },
    { name: 'Dhanbad', cities: ['Dhanbad', 'Bokaro', 'Giridih', 'Deoghar'] },
    { name: 'Deoghar', cities: ['Deoghar', 'Dumka', 'Godda', 'Jamtara'] },
  ],
  'CH': [
    { name: 'Raipur', cities: ['Raipur', 'Durg', 'Bhilai', 'Rajnandgaon'] },
    { name: 'Bilaspur', cities: ['Bilaspur', 'Korba', 'Janjgir-Champa', 'Raigarh'] },
    { name: 'Bastar', cities: ['Jagdalpur', 'Kondagaon', 'Bijapur', 'Narayanpur'] },
  ],
  'UK': [
    { name: 'Dehradun', cities: ['Dehradun', 'Haridwar', 'Rishikesh', 'Mussoorie'] },
    { name: 'Nainital', cities: ['Nainital', 'Haldwani', 'Rudrapur', 'Kashipur'] },
    { name: 'Uttarkashi', cities: ['Uttarkashi', 'Tehri', 'Pauri', 'Chamoli'] },
  ],
  'HP': [
    { name: 'Shimla', cities: ['Shimla', 'Solan', 'Kullu', 'Manali'] },
    { name: 'Kangra', cities: ['Dharamshala', 'Palampur', 'Kangra', 'Baijnath'] },
    { name: 'Mandi', cities: ['Mandi', 'Sundernagar', 'Karsog', 'Jogindernagar'] },
  ],
  'JK': [
    { name: 'Srinagar', cities: ['Srinagar', 'Ganderbal', 'Budgam', 'Pulwama'] },
    { name: 'Jammu', cities: ['Jammu', 'Kathua', 'Udhampur', 'Reasi'] },
    { name: 'Anantnag', cities: ['Anantnag', 'Kulgam', 'Shopian', 'Pulwama'] },
  ],
  'GA': [
    { name: 'North Goa', cities: ['Panaji', 'Mapusa', 'Porvorim', 'Calangute'] },
    { name: 'South Goa', cities: ['Margao', 'Vasco da Gama', 'Ponda', 'Cuncolim'] },
  ],
  'AS': [
    { name: 'Kamrup', cities: ['Guwahati', 'Dispur', 'Nagaon', 'Tezpur'] },
    { name: 'Dibrugarh', cities: ['Dibrugarh', 'Tinsukia', 'Jorhat', 'Sivasagar'] },
    { name: 'Silchar', cities: ['Silchar', 'Hailakandi', 'Karimganj', 'Cachar'] },
  ],
  'MN': [
    { name: 'Imphal West', cities: ['Imphal', 'Lamphel', 'Patsoi', 'Wangoi'] },
    { name: 'Imphal East', cities: ['Imphal', 'Andro', 'Lamlai', 'Sekmai'] },
    { name: 'Bishnupur', cities: ['Bishnupur', 'Moirang', 'Nambol', 'Kwakta'] },
  ],
  'MZ': [
    { name: 'Aizawl', cities: ['Aizawl', 'Lunglei', 'Saiha', 'Champhai'] },
    { name: 'Lunglei', cities: ['Lunglei', 'Saiha', 'Lawngtlai', 'Mamit'] },
  ],
  'NL': [
    { name: 'Kohima', cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'] },
    { name: 'Dimapur', cities: ['Dimapur', 'Kohima', 'Chumukedima', 'Niuland'] },
  ],
  'TR': [
    { name: 'West Tripura', cities: ['Agartala', 'Mohpur', 'Jirania', 'Dukli'] },
    { name: 'South Tripura', cities: ['Udaipur', 'Belonia', 'Sabroom', 'Amarpur'] },
  ],
  'ML': [
    { name: 'East Khasi Hills', cities: ['Shillong', 'Sohra', 'Mawkyrwat', 'Mawsynram'] },
    { name: 'West Khasi Hills', cities: ['Nongstoin', 'Mairang', 'Mawshynrut', 'Mawphlang'] },
  ],
  'SK': [
    { name: 'East Sikkim', cities: ['Gangtok', 'Rangpo', 'Pakyong', 'Singtam'] },
    { name: 'West Sikkim', cities: ['Geyzing', 'Pelling', 'Ravangla', 'Jorethang'] },
  ],
  'AR': [
    { name: 'Papum Pare', cities: ['Itanagar', 'Naharlagun', 'Doimukh', 'Kimin'] },
    { name: 'Tawang', cities: ['Tawang', 'Bomdila', 'Dirang', 'Sela'] },
  ],
};

export const getDistrictsByState = (stateCode) => {
  return stateDistricts[stateCode] || [];
};

export const getCitiesByDistrict = (stateCode, districtName) => {
  const districts = stateDistricts[stateCode] || [];
  const district = districts.find(d => d.name === districtName);
  return district ? district.cities : [];
};
