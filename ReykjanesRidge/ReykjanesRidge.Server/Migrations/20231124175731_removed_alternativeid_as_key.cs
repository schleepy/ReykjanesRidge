using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReykjanesRidge.Server.Migrations
{
    public partial class removed_alternativeid_as_key : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropUniqueConstraint(
                name: "AK_Earthquakes_AlternativeID",
                table: "Earthquakes");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddUniqueConstraint(
                name: "AK_Earthquakes_AlternativeID",
                table: "Earthquakes",
                column: "AlternativeID");
        }
    }
}
