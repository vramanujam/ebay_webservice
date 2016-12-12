package ebay_webservice;
import javax.jws.WebService;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebService
public class ebay_services {
	String dbUrl = "jdbc:mysql://localhost:3306/ebay";
 
	public String testWebService()
	{
		
		JSONArray ja = new JSONArray();
	      try {
	    	
	    	JSONObject json = new JSONObject();
			json.put("success", true);
			json.put("message", "test");
			ja.put(json);
	      } catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	      
	    return ja.toString();
		
	}
	public boolean signup(String firstname, String lastname, String email, String password)
	{
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			PreparedStatement stmt = con.prepareStatement("insert into ebayuserdetails(email,firstName,lastName,password) values(?,?,?,?)");
			stmt.setString(1, email);
			stmt.setString(2, firstname);
			stmt.setString(3, lastname);
			stmt.setString(4, password);
			int rs = stmt.executeUpdate();
			con.close();
			if(rs==1){
				return true;				
			}
			else 
				return false;
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
	}
	public String signin(String email)
	{
		try {
				Class.forName("com.mysql.jdbc.Driver");
				Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
				PreparedStatement stmt = con.prepareStatement("Select * from ebayuserdetails where email=?"); 
				stmt.setString(1, email);
				ResultSet rs = stmt.executeQuery();
				if(rs.next()){
				JSONArray jsonArray = new JSONArray();
				
				int total_rows = rs.getMetaData().getColumnCount();
				JSONObject ret = new JSONObject();
				for (int i = 0; i < total_rows; i++) {
					ret.put(rs.getMetaData().getColumnLabel(i + 1)
				            .toLowerCase(), rs.getObject(i + 1));				    
				}
				System.out.println(ret.toString());
			    String query = "UPDATE ebayuserdetails SET logintime = ? Where email = ?";
		        PreparedStatement preparedStmt = con.prepareStatement(query);
		        java.util.Date dt = new java.util.Date();
		        preparedStmt.setString(1, dt.toString());
		        preparedStmt.setString(2, email);
		        preparedStmt.executeUpdate();
		        con.close();
		        return ret.toString();
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "";
	}
	public boolean postad(String itemname, String itemdescription, String sellerinformation, double itemprice, int quantity, String bidding, int userid,String email)
	{
		
		try {
				Class.forName("com.mysql.jdbc.Driver");
				Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
				String query = "INSERT INTO advertisements (itemname,itemdescription,sellerinformation,itemprice,quantity,bidding,userid) values (?,?,?,?,?,?,?)";
				PreparedStatement stmt = con.prepareStatement(query); 
				stmt.setString(1, itemname);
				stmt.setString(2, itemdescription);
				stmt.setString(3, sellerinformation);
				stmt.setDouble(4, itemprice);
				stmt.setInt(5, quantity);
				stmt.setString(6, bidding);
				stmt.setInt(7, userid);
				stmt.execute();
				query = "INSERT INTO userhistory(itemno,itemname,itemdescription,sellerinformation,transactiontype,quantity,itemprice,email,userid,dateposted) select advertisements.itemno,itemname,itemdescription,sellerinformation,\'Sold\',quantity,itemprice,?,?,dateposted from advertisements where itemno = (select max(itemno) from advertisements where userid = ?)";
				stmt = con.prepareStatement(query);
				stmt.setString(1, email);
				stmt.setInt(2, userid);
				stmt.setInt(3, userid);
				System.out.println(stmt);
				stmt.execute();
				con.close();
				
			} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		}
		return true;
	}
	public String getad(int id)
	{
		JSONObject retObj = new JSONObject();
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			String query = "select * from advertisements where itemno not in (select itemno from cart where cart.userid = ?) and itemno not in (select itemno from bid where bid.userid = ?) and userid != ?";
			JSONArray jsonArray = new JSONArray();
			PreparedStatement stmt = con.prepareStatement(query);
			stmt.setInt(1, id);
			stmt.setInt(2, id);
			stmt.setInt(3, id);
			ResultSet rs = stmt.executeQuery();
			 while (rs.next()) 
			 {
		         int total_rows = rs.getMetaData().getColumnCount();
		         JSONObject temp = new JSONObject();
		         for (int i = 0; i < total_rows; i++) {
		             temp.put(rs.getMetaData().getColumnLabel(i + 1)
		                     .toLowerCase(), rs.getObject(i + 1));
		             
		         }
		         jsonArray.put(temp);
		     }
			 con.close();
			 retObj.put("value", jsonArray);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 		
		return retObj.toString();
	}
	public String getcartvolume(int id)
	{
		JSONObject retObj = new JSONObject();
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			String query = "select count(*) as cartcount from cart where userid = ?";
			JSONArray jsonArray = new JSONArray();
			PreparedStatement stmt = con.prepareStatement(query);
			stmt.setInt(1, id);
			ResultSet rs = stmt.executeQuery();
			while (rs.next()) 
			{
		        int total_rows = rs.getMetaData().getColumnCount();
		        JSONObject temp = new JSONObject();
		        for (int i = 0; i < total_rows; i++) {
		            temp.put(rs.getMetaData().getColumnLabel(i + 1)
		                    .toLowerCase(), rs.getObject(i + 1));         
		         }
		         jsonArray.put(temp);
		     }
			 con.close();
			 retObj.put("value", jsonArray);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return retObj.toString();
	}
	public String getUserInfo(int id)
	{
		JSONObject retObj = new JSONObject();
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			String query = "select * from ebayuserdetails where userid = ?";
			JSONArray jsonArray = new JSONArray();
			PreparedStatement stmt = con.prepareStatement(query);
			stmt.setInt(1, id);
			ResultSet rs = stmt.executeQuery();
			 while (rs.next()) 
			 {
		         int total_rows = rs.getMetaData().getColumnCount();
		         JSONObject temp = new JSONObject();
		         for (int i = 0; i < total_rows; i++) {
		             temp.put(rs.getMetaData().getColumnLabel(i + 1)
		                     .toLowerCase(), rs.getObject(i + 1));
		             
		         }
		         jsonArray.put(temp);
		     }
			 con.close();
			 retObj.put("value", jsonArray);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return retObj.toString();
		
	}
	public boolean addBid(int itemno, int userid, double bidplaced, int quantity)
	{
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			PreparedStatement stmt = con.prepareStatement("insert into bid (itemno,userid, bidplaced,quantityselected) VALUES(?,?,?,?) on duplicate key update quantityselected = ?, bidplaced = ?");
			stmt.setInt(1, itemno);
			stmt.setInt(2, userid);
			stmt.setDouble(3, bidplaced);
			stmt.setInt(4, quantity);
			stmt.setInt(5, quantity);
			stmt.setDouble(6, bidplaced);
			int rs = stmt.executeUpdate();
			con.close();
			if(rs==1){
				return true;				
			}
			else 
				return false;
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
	}
	public String searchad(String searchphrase, int userid)
	{
		JSONObject retObj = new JSONObject();
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			String query = "select * from advertisements where itemname REGEXP ? and  userid != ?";
			JSONArray jsonArray = new JSONArray();
			PreparedStatement stmt = con.prepareStatement(query);
			stmt.setString(1, searchphrase);
			stmt.setInt(2, userid);
			ResultSet rs = stmt.executeQuery();
			 while (rs.next()) 
			 {
		         int total_rows = rs.getMetaData().getColumnCount();
		         JSONObject temp = new JSONObject();
		         for (int i = 0; i < total_rows; i++) {
		             temp.put(rs.getMetaData().getColumnLabel(i + 1)
		                     .toLowerCase(), rs.getObject(i + 1));
		             
		         }
		         jsonArray.put(temp);
		     }
			 con.close();
			 retObj.put("value", jsonArray);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 		
		return retObj.toString();
	}
	public boolean updateSingleUserVal(String data, String value , int userid)
	{
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			PreparedStatement stmt = con.prepareStatement("UPDATE ebayuserdetails SET "+data+" = ? Where userid = ?");
			//stmt.setString(1, data);
			stmt.setString(1, value);
			stmt.setInt(2, userid);
			System.out.println(stmt);
			int rs = stmt.executeUpdate();
			con.close();
			if(rs==1){
				return true;				
			}
			else 
				return false;
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
	}
	public String changeCartQuantity(int quantityselected, int cartno, int userid)
	{
		JSONObject retObj = new JSONObject();
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			
			PreparedStatement stmt = con.prepareStatement("UPDATE cart SET quantityselected = ? Where cartno = ?");
			//stmt.setString(1, data);
			stmt.setInt(1, quantityselected);
			stmt.setInt(2, cartno);
			System.out.println(stmt);
			stmt.executeUpdate();			
			String query = "select * from advertisements INNER JOIN cart ON advertisements.itemno = cart.itemno INNER JOIN ebayuserdetails ON cart.userid = ebayuserdetails.userid where advertisements.quantity >= cart.quantityselected and cart.userid = ?";
			JSONArray jsonArray = new JSONArray();
			stmt = con.prepareStatement(query);
			stmt.setInt(1, userid);
			ResultSet rs = stmt.executeQuery();
			 while (rs.next()) 
			 {
		         int total_rows = rs.getMetaData().getColumnCount();
		         JSONObject temp = new JSONObject();
		         for (int i = 0; i < total_rows; i++) {
		             temp.put(rs.getMetaData().getColumnLabel(i + 1)
		                     .toLowerCase(), rs.getObject(i + 1));
		             
		         }
		         jsonArray.put(temp);
		     }
			 con.close();
			 retObj.put("value", jsonArray);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 		
		return retObj.toString();
	}
	public String getUserHistory(int userid)
	{
		JSONObject retObj = new JSONObject();
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			String query = "SELECT * from userhistory where userid = ?";
			JSONArray jsonArray = new JSONArray();
			PreparedStatement stmt = con.prepareStatement(query);
			//stmt.setString(1, searchphrase);
			stmt.setInt(1, userid);
			ResultSet rs = stmt.executeQuery();
			 while (rs.next()) 
			 {
		         int total_rows = rs.getMetaData().getColumnCount();
		         JSONObject temp = new JSONObject();
		         for (int i = 0; i < total_rows; i++) {
		             temp.put(rs.getMetaData().getColumnLabel(i + 1)
		                     .toLowerCase(), rs.getObject(i + 1));
		             
		         }
		         jsonArray.put(temp);
		     }
			 con.close();
			 retObj.put("value", jsonArray);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 		
		return retObj.toString();
	}
	public boolean addToCart(int itemno, int quantityselected, int userid)
	{
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			PreparedStatement stmt = con.prepareStatement("INSERT INTO cart (itemno,quantityselected,userid) values (?,?,?)");
			//stmt.setString(1, data);
			stmt.setInt(1, itemno);
			stmt.setInt(2, quantityselected);
			stmt.setInt(3, userid);
			System.out.println(stmt);
			int rs = stmt.executeUpdate();
			con.close();
			if(rs==1){
				return true;				
			}
			else 
				return false;
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
	}
	public String getCart(int userid)
	{
		JSONObject retObj = new JSONObject();
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			String query = "select * from advertisements INNER JOIN cart ON advertisements.itemno = cart.itemno INNER JOIN ebayuserdetails ON cart.userid = ebayuserdetails.userid where advertisements.quantity >= cart.quantityselected and cart.userid = ?";
			JSONArray jsonArray = new JSONArray();
			PreparedStatement stmt = con.prepareStatement(query);
			stmt.setInt(1, userid);
			ResultSet rs = stmt.executeQuery();
			 while (rs.next()) 
			 {
		         int total_rows = rs.getMetaData().getColumnCount();
		         JSONObject temp = new JSONObject();
		         for (int i = 0; i < total_rows; i++) {
		             temp.put(rs.getMetaData().getColumnLabel(i + 1)
		                     .toLowerCase(), rs.getObject(i + 1));
		             
		         }
		         jsonArray.put(temp);
		     }
			 retObj.put("cartitems", jsonArray);
			 query = "select * from advertisements INNER JOIN bid ON advertisements.itemno = bid.itemno INNER JOIN ebayuserdetails ON bid.userid = ebayuserdetails.userid where  bid.userid = ?";
			 jsonArray = new JSONArray();
			 stmt = con.prepareStatement(query);
			 stmt.setInt(1, userid);
			 rs = stmt.executeQuery();
			 while (rs.next()) 
			 {
		         int total_rows = rs.getMetaData().getColumnCount();
		         JSONObject temp = new JSONObject();
		         for (int i = 0; i < total_rows; i++) {
		             temp.put(rs.getMetaData().getColumnLabel(i + 1)
		                     .toLowerCase(), rs.getObject(i + 1));
		             
		         }
		         jsonArray.put(temp);
		     }
			 con.close();
			 retObj.put("biditems", jsonArray);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return retObj.toString();
	}
	public String removeFromCart(int itemno,int userid)
	{
		JSONObject retObj = new JSONObject();
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			String query = "delete from cart where itemno = ?";
			JSONArray jsonArray = new JSONArray();
			PreparedStatement stmt = con.prepareStatement(query);
			stmt.setInt(1, itemno);
			stmt.executeUpdate();			 
			retObj.put("cartitems", jsonArray);
			query = "select * from advertisements INNER JOIN cart ON advertisements.itemno = cart.itemno INNER JOIN ebayuserdetails ON cart.userid = ebayuserdetails.userid where advertisements.quantity >= cart.quantityselected and cart.userid = ?";
			jsonArray = new JSONArray();
			stmt = con.prepareStatement(query);
			stmt.setInt(1, userid);
			ResultSet rs = stmt.executeQuery();
			while (rs.next()) 
			{
		        int total_rows = rs.getMetaData().getColumnCount();
		        JSONObject temp = new JSONObject();
		        for (int i = 0; i < total_rows; i++) {
		            temp.put(rs.getMetaData().getColumnLabel(i + 1)
		                    .toLowerCase(), rs.getObject(i + 1));
		            
		        }
		        jsonArray.put(temp);
		    }
			con.close();
			retObj.put("cartitems", jsonArray);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return retObj.toString();
	}
	public boolean payment(int userid)
	{
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			PreparedStatement stmt = con.prepareStatement("insert into userhistory(itemno,itemname,itemdescription,sellerinformation,transactiontype,quantity,itemprice,email,userid,dateposted) select advertisements.itemno,itemname,itemdescription,sellerinformation,\'bought\',cart.quantityselected as quantity,itemprice,ebayuserdetails.email,ebayuserdetails.userid,dateposted from advertisements  INNER JOIN cart ON advertisements.itemno = cart.itemno INNER JOIN ebayuserdetails ON cart.userid = ebayuserdetails.userid where advertisements.quantity >= cart.quantityselected and ebayuserdetails.userid = ?");
			//stmt.setString(1, data);
			stmt.setInt(1, userid);
			int rs1 = stmt.executeUpdate();
			stmt = con.prepareStatement("update advertisements inner join cart  on cart.itemno = advertisements.itemno set advertisements.quantity = (advertisements.quantity - cart.quantityselected) where cart.quantityselected <= advertisements.quantity and cart.userid = ?");
			//stmt.setString(1, data);
			stmt.setInt(1, userid);
			int rs2 = stmt.executeUpdate();
			//
			stmt = con.prepareStatement("delete from cart where userid = ?");
			//stmt.setString(1, data);
			stmt.setInt(1, userid);
			int rs3 = stmt.executeUpdate();
			stmt = con.prepareStatement("delete from cart where cartno in (select cartno from advertisements inner join (select * from cart) as cart on cart.itemno= advertisements.itemno where cart.quantityselected > advertisements.quantity)");
			stmt.execute();
			stmt = con.prepareStatement("delete from advertisements where quantity <= 0");
			stmt.execute();
			
			con.close();
			System.out.println(rs1 + " " + rs2 +  " " + rs3   );
			return true;
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
	}
	public String getebayhandle(String handle)
	{
		JSONObject retObj = new JSONObject();
		try {
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			String query = "SELECT * from ebayuserdetails where ebayhandle = ?";
			JSONArray jsonArray = new JSONArray();
			PreparedStatement stmt = con.prepareStatement(query);
			//stmt.setString(1, searchphrase);
			stmt.setString(1, handle);
			ResultSet rs = stmt.executeQuery();
			 while (rs.next()) 
			 {
		         int total_rows = rs.getMetaData().getColumnCount();
		         JSONObject temp = new JSONObject();
		         for (int i = 0; i < total_rows; i++) {
		             temp.put(rs.getMetaData().getColumnLabel(i + 1)
		                     .toLowerCase(), rs.getObject(i + 1));
		             
		         }
		         jsonArray.put(temp);
		     }
			 con.close();
			 retObj.put("value", jsonArray);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 		
		return retObj.toString();
	}
	public boolean bidding()
	{
		try
		{
			Class.forName("com.mysql.jdbc.Driver");
			Connection con = DriverManager.getConnection (dbUrl, "root", "oilfoods");
			String query = "SELECT * FROM advertisements WHERE dateposted <= NOW() - INTERVAL 5 minute and bidding = \'true\'";
			Statement stmt = con.createStatement();
			ResultSet rs = stmt.executeQuery(query);
			while(rs.next())
			{
				int quantity = rs.getInt("quantity");
				int itemno = rs.getInt("itemno");
				PreparedStatement prep_stmt = con.prepareStatement("select * from bid where itemno = ? order by bidplaced DESC ,quantityselected DESC");
				prep_stmt.setInt(1, itemno);
				ResultSet rs_bid = prep_stmt.executeQuery();
				rs_bid.last(); 
				int total = rs_bid.getRow();
				rs_bid.beforeFirst();
				if(total == 0)
				{
					stmt.executeUpdate("DELETE FROM advertisements WHERE itemno = " + itemno);
				}
				else
				{
					while(rs_bid.next())
					{
						int itemno_bid = rs.getInt("itemno");
						String itemname_bid = rs.getString("itemname");
						String itemdescription_bid = rs.getString("itemdescription");
						String transactiontype_bid = "Bought";
						String sellerinformation_bid = rs.getString("sellerinformation");
						int quantityselected_bid = 	rs_bid.getInt("quantityselected");
						double itemprice_bid = rs_bid.getDouble("bidplaced");
						int user_bid = rs_bid.getInt("userid");
						prep_stmt = con.prepareStatement("INSERT INTO userhistory (itemno,itemname,itemdescription,transactiontype,sellerinformation,quantity,itemprice,userid) values (?,?,?,?,?,?,?,?)");	
						prep_stmt.setInt(1,itemno_bid);
						prep_stmt.setString(2,itemname_bid);
						prep_stmt.setString(3,itemdescription_bid);
						prep_stmt.setString(4,transactiontype_bid);
						prep_stmt.setString(5,sellerinformation_bid);
						prep_stmt.setInt(6, quantityselected_bid);
						prep_stmt.setDouble(7,itemprice_bid);
						prep_stmt.setDouble(8,user_bid);
						prep_stmt.executeUpdate();
					}
					prep_stmt = con.prepareStatement("DELETE FROM bid WHERE itemno = ?");
					prep_stmt.setInt(1,rs.getInt("itemno"));
					prep_stmt.executeUpdate();
					prep_stmt = con.prepareStatement("DELETE FROM advertisements WHERE itemno = ?");
					prep_stmt.setInt(1,rs.getInt("itemno"));
					prep_stmt.executeUpdate();
				}
			}
			con.close();
			return true;
		}
		catch(Exception ex)
		{
			
			
			ex.printStackTrace();
		}
		
		return false;
	}
}
