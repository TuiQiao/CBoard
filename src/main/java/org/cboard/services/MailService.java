package org.cboard.services;

import com.alibaba.fastjson.JSONObject;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.mail.EmailAttachment;
import org.apache.commons.mail.EmailException;
import org.apache.commons.mail.HtmlEmail;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.cboard.pojo.DashboardJob;
import org.cboard.services.persist.PersistContext;
import org.cboard.services.persist.excel.XlsProcessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.mail.Authenticator;
import javax.mail.util.ByteArrayDataSource;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by yfyuan on 2017/2/10.
 */
@Service
public class MailService {

    @Autowired
    private XlsProcessService xlsProcessService;

    @Autowired
    private PersistService persistService;

    @Value("${mail.smtp.host}")
    private String mail_smtp_host;

    @Value("${mail.smtp.port}")
    private Integer mail_smtp_port;

    @Value("${mail.smtp.username:#{null}}")
    private String mail_smtp_username;

    @Value("${mail.smtp.password:#{null}}")
    private String mail_smtp_password;

    @Value("${mail.smtp.from}")
    private String mail_smtp_from;

    public String sendDashboard(DashboardJob job) {
        JSONObject config = JSONObject.parseObject(job.getConfig());

        List<PersistContext> persistContextList = config.getJSONArray("boards").stream()
                .map(e -> persistService.persist(((JSONObject) e).getLong("id"), job.getUserId()))
                .collect(Collectors.toList());

        List<PersistContext> workbookList = config.getJSONArray("boards").stream()
                .filter(e -> ((JSONObject) e).getString("type").contains("xls")).map(e -> persistContextList.stream().filter(f -> f.getDashboardId() == ((JSONObject) e).getLong("id")).findFirst().get()).collect(Collectors.toList());

        HSSFWorkbook workbook = xlsProcessService.dashboardToXls(workbookList);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            workbook.write(baos);
        } catch (IOException e) {
            e.printStackTrace();
        }

        List<PersistContext> picList = config.getJSONArray("boards").stream()
                .filter(e -> ((JSONObject) e).getString("type").contains("img")).map(e -> persistContextList.stream().filter(f -> f.getDashboardId() == ((JSONObject) e).getLong("id")).findFirst().get()).collect(Collectors.toList());

        try {
            HtmlEmail email = new HtmlEmail();
            StringBuilder sb = new StringBuilder("<html>");
            picList.stream().forEach(e -> {
                String b64 = e.getData().getString("img");
                byte[] bytes = Base64.getDecoder().decode(b64.substring(23));
                ByteArrayDataSource ds = new ByteArrayDataSource(bytes, "application/octet-stream");
                try {
                    String cid = email.embed(ds, e.getDashboardId() + ".jpg");
                    sb.append("<img src='cid:").append(cid).append("'></img></br>");
                } catch (EmailException e1) {
                    e1.printStackTrace();
                }
            });
            email.setHtmlMsg(sb.append("</html>").toString());
            email.setTextMsg("Your email client does not support HTML messages");
            ByteArrayDataSource ds = new ByteArrayDataSource(baos.toByteArray(), "application/octet-stream");
            email.attach(ds, "report.xls", EmailAttachment.ATTACHMENT, "test");
            email.setHostName(mail_smtp_host);
            email.setSmtpPort(mail_smtp_port);
            if (mail_smtp_username != null && mail_smtp_password != null) {
                email.setAuthentication(mail_smtp_username, mail_smtp_password);
            }
            email.setFrom(mail_smtp_from);
            email.setSubject(config.getString("subject"));
            String to = config.getString("to");
            if (StringUtils.isNotBlank(to)) {
                if (to.contains(";")) {
                    email.addTo(to.split(";"));
                } else {
                    email.addTo(to);
                }
            }
            String cc = config.getString("cc");
            if (StringUtils.isNotBlank(cc)) {
                if (cc.contains(";")) {
                    email.addCc(cc.split(";"));
                } else {
                    email.addCc(cc);
                }
            }
            String bcc = config.getString("bcc");
            if (StringUtils.isNotBlank(bcc)) {
                if (bcc.contains(";")) {
                    email.addBcc(bcc.split(";"));
                } else {
                    email.addBcc(bcc);
                }
            }
            email.send();
        } catch (EmailException e) {
            e.printStackTrace();
        }
        return null;
    }

}
