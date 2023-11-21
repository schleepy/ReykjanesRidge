using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReykjanesRidge.Server.Migrations
{
    public partial class added_alternative_id_to_earthquake : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AlternativeID",
                table: "Earthquakes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Earthquakes_AlternativeID",
                table: "Earthquakes",
                column: "AlternativeID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropUniqueConstraint(
                name: "AK_Earthquakes_AlternativeID",
                table: "Earthquakes");

            migrationBuilder.DropColumn(
                name: "AlternativeID",
                table: "Earthquakes");
        }
    }
}
