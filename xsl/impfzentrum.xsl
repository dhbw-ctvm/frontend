<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/impfzentrum">
        <html>
            <body>
                <h4><xsl:value-of select="name"/></h4>
                <br/>
                <p><xsl:value-of select="addresse" /></p>
                <br/>
                <b>Öffnungszeiten:</b>
                <table border="1">
                    <tr>
                        <th>Tag</th>
                        <th>Uhrzeit</th>
                    </tr>
                    <xsl:for-each select="oeffnungszeiten/zeit">
                        <tr>
                            <td><xsl:value-of select="@tag"/>s</td>
                            <td><xsl:value-of select="text()"/></td>
                        </tr>
                    </xsl:for-each>
                </table>
                <br/>
                <a target="blank">
                    <xsl:attribute name="href">
                        <xsl:value-of select="terminbuchung"/>
                    </xsl:attribute>
                    Terminbuchung
                </a>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>