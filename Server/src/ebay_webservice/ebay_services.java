package ebay_webservice;
import javax.jws.WebService;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
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
			 retObj.put("value", jsonArray);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 		
		return retObj.toString();
	}

}
